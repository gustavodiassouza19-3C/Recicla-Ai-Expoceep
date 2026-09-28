"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { parseCssColor, type ColorTriplet } from "@/lib/css-color";
import { cn } from "@/lib/utils";

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uLightMode;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  if(uLightMode>0.5){
    float energy=max(max(col.r,col.g),col.b);
    vec3 hue=col/max(energy,0.001);
    float chroma=length(col-vec3(dot(col,vec3(0.333333))));
    float coverage=clamp(0.12+chroma*1.15+energy*0.18,0.0,0.88);
    col=mix(vec3(1.0),clamp(hue*0.58+col*0.18,0.0,1.0),coverage);
  }

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

type UniformValue = { value: number | Float32Array };
type UniformMap = Record<string, UniformValue>;

/** Cor sRGB ja resolvida ou qualquer valor de cor aceito por parseCssColor. */
export type GrainientColor = string | ColorTriplet;

type GrainientContext = {
  renderer: Renderer;
  program: Program;
  mesh: Mesh;
  canvas: HTMLCanvasElement;
};

type GrainientValues = {
  timeSpeed: number;
  colorBalance: number;
  warpStrength: number;
  warpFrequency: number;
  warpSpeed: number;
  warpAmplitude: number;
  blendAngle: number;
  blendSoftness: number;
  rotationAmount: number;
  noiseScale: number;
  grainAmount: number;
  grainScale: number;
  grainAnimated: boolean;
  contrast: number;
  gamma: number;
  saturation: number;
  centerX: number;
  centerY: number;
  zoom: number;
  color1: GrainientColor;
  color2: GrainientColor;
  color3: GrainientColor;
  lightMode: boolean;
};

// O contexto WebGL e o program sao mantidos vivos entre renders para que a
// sincronizacao de props apenas atualize uniforms, sem recriar a GPU.
const ctxMap = new WeakMap<HTMLDivElement, GrainientContext>();

const writeColor = (uniform: UniformValue, color: GrainientColor) => {
  const rgb = typeof color === "string" ? parseCssColor(color) : color;
  (uniform.value as Float32Array).set(rgb ?? [1, 1, 1]);
};

function createUniforms(): UniformMap {
  return {
    iTime: { value: 0 },
    iResolution: { value: new Float32Array([1, 1]) },
    uTimeSpeed: { value: 0 },
    uColorBalance: { value: 0 },
    uWarpStrength: { value: 0 },
    uWarpFrequency: { value: 0 },
    uWarpSpeed: { value: 0 },
    uWarpAmplitude: { value: 0 },
    uBlendAngle: { value: 0 },
    uBlendSoftness: { value: 0 },
    uRotationAmount: { value: 0 },
    uNoiseScale: { value: 0 },
    uGrainAmount: { value: 0 },
    uGrainScale: { value: 0 },
    uGrainAnimated: { value: 0 },
    uContrast: { value: 1 },
    uGamma: { value: 1 },
    uSaturation: { value: 1 },
    uCenterOffset: { value: new Float32Array([0, 0]) },
    uZoom: { value: 1 },
    uColor1: { value: new Float32Array([1, 1, 1]) },
    uColor2: { value: new Float32Array([1, 1, 1]) },
    uColor3: { value: new Float32Array([1, 1, 1]) },
    uLightMode: { value: 0 },
  };
}

function applyUniformValues(
  uniforms: Record<string, UniformValue>,
  values: GrainientValues
) {
  uniforms.uTimeSpeed.value = values.timeSpeed;
  uniforms.uColorBalance.value = values.colorBalance;
  uniforms.uWarpStrength.value = values.warpStrength;
  uniforms.uWarpFrequency.value = values.warpFrequency;
  uniforms.uWarpSpeed.value = values.warpSpeed;
  uniforms.uWarpAmplitude.value = values.warpAmplitude;
  uniforms.uBlendAngle.value = values.blendAngle;
  uniforms.uBlendSoftness.value = values.blendSoftness;
  uniforms.uRotationAmount.value = values.rotationAmount;
  uniforms.uNoiseScale.value = values.noiseScale;
  uniforms.uGrainAmount.value = values.grainAmount;
  uniforms.uGrainScale.value = values.grainScale;
  uniforms.uGrainAnimated.value = values.grainAnimated ? 1.0 : 0.0;
  uniforms.uContrast.value = values.contrast;
  uniforms.uGamma.value = values.gamma;
  uniforms.uSaturation.value = values.saturation;
  uniforms.uZoom.value = values.zoom;
  uniforms.uLightMode.value = values.lightMode ? 1.0 : 0.0;

  const centerOffset = uniforms.uCenterOffset.value as Float32Array;
  centerOffset[0] = values.centerX;
  centerOffset[1] = values.centerY;

  writeColor(uniforms.uColor1, values.color1);
  writeColor(uniforms.uColor2, values.color2);
  writeColor(uniforms.uColor3, values.color3);
}

export type GrainientProps = {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: GrainientColor;
  color2?: GrainientColor;
  color3?: GrainientColor;
  lightMode?: boolean;
  className?: string;
  onError?: () => void;
} & Omit<React.ComponentPropsWithoutRef<"div">, "color">;

const Grainient = forwardRef<HTMLDivElement, GrainientProps>(function Grainient(
  {
    timeSpeed = 0.25,
    colorBalance = 0.0,
    warpStrength = 1.0,
    warpFrequency = 5.0,
    warpSpeed = 2.0,
    warpAmplitude = 50.0,
    blendAngle = 0.0,
    blendSoftness = 0.05,
    rotationAmount = 500.0,
    noiseScale = 2.0,
    grainAmount = 0.1,
    grainScale = 2.0,
    grainAnimated = false,
    contrast = 1.5,
    gamma = 1.0,
    saturation = 1.0,
    centerX = 0.0,
    centerY = 0.0,
    zoom = 0.9,
    color1 = "#FF9FFC",
    color2 = "#5227FF",
    color3 = "#B497CF",
    lightMode = false,
    className,
    onError,
    ...props
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const setContainer = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const values = useMemo<GrainientValues>(
    () => ({
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
      color1,
      color2,
      color3,
      lightMode,
    }),
    [
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
      color1,
      color2,
      color3,
      lightMode,
    ]
  );

  // Semeia o primeiro frame com os valores iniciais, para o canvas nunca piscar
  // com as cores neutras de createUniforms.
  const initialValues = useRef(values);

  // Effect 1: cria o contexto WebGL uma unica vez e pausa quando sai da tela
  // ou quando a aba fica em segundo plano.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      onErrorRef.current?.();
      return;
    }

    const gl = renderer.gl;
    if (!gl) {
      onErrorRef.current?.();
      return;
    }

    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: createUniforms(),
    });

    applyUniformValues(
      program.uniforms as unknown as Record<string, UniformValue>,
      initialValues.current
    );

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh, canvas });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const resolution = program.uniforms.iResolution.value as Float32Array;
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    let frame = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const start = performance.now();

    const loop = (now: number) => {
      program.uniforms.iTime.value = (now - start) * 0.001;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && frame === 0) {
        frame = requestAnimationFrame(loop);
      }
    };
    const tryStop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          tryStart();
        } else {
          tryStop();
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const handleVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        tryStart();
      } else {
        tryStop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    tryStart();

    return () => {
      tryStop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      ctxMap.delete(container);
      try {
        container.removeChild(canvas);
      } catch {
        // container ja desmontado
      }
    };
  }, []);

  // Effect 2: sincroniza props com uniforms, sem custo de GPU e sem teardown.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;

    applyUniformValues(
      ctx.program.uniforms as unknown as Record<string, UniformValue>,
      values
    );
  }, [values]);

  return (
    <div
      ref={setContainer}
      data-slot="grainient"
      className={cn("relative h-full w-full overflow-hidden", className)}
      {...props}
    />
  );
});

export { Grainient, Grainient as grainient };
