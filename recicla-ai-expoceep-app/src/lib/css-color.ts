export type ColorTriplet = [number, number, number];

const clamp01 = (value: number) =>
  Number.isFinite(value) ? (value < 0 ? 0 : value > 1 ? 1 : value) : 0;

const toNumber = (raw: string | undefined, percentageScale: number): number => {
  if (!raw) return 0;
  if (raw.endsWith("%")) {
    const percent = Number.parseFloat(raw);
    return Number.isNaN(percent) ? 0 : (percent / 100) * percentageScale;
  }
  const value = Number.parseFloat(raw);
  return Number.isNaN(value) ? 0 : value;
};

// Clampa o canal linear antes da codificacao gamma. Sem isso, um canal
// negativo levaria Math.pow(negativo, 1/2.4) a NaN, e o NaN se espalharia
// pelo shader inteiro.
const encodeGamma = (channel: number) => {
  const c = clamp01(channel);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};

/** OKLCH -> sRGB. a e b vivem na escala +-0.4 do OKLab. */
export function oklchToRgb(
  lightness: number,
  chroma: number,
  hue: number
): ColorTriplet {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = lPrime * lPrime * lPrime;
  const m = mPrime * mPrime * mPrime;
  const s = sPrime * sPrime * sPrime;

  return [
    encodeGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    encodeGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    encodeGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function parseHex(input: string): ColorTriplet | null {
  const hex = input.slice(1);
  const full =
    hex.length === 3 || hex.length === 4
      ? hex
          .split("")
          .map((char) => (char.length === 1 ? char + char : char))
          .join("")
      : hex;
  if (full.length !== 6 && full.length !== 8) return null;
  if (!/^[0-9a-f]+$/.test(full)) return null;
  return [
    Number.parseInt(full.slice(0, 2), 16) / 255,
    Number.parseInt(full.slice(2, 4), 16) / 255,
    Number.parseInt(full.slice(4, 6), 16) / 255,
  ];
}

/**
 * Le hex, rgb(), oklch(), oklab() e color(srgb ...).
 *
 * Nao le lab() de proposito: `lab()` e CIE L*a*b* (D50, a/b na escala +-128) e
 * nao OKLab, entao interpretá-la com a matriz do OKLab devolve cores erradas.
 * Use resolveCssColor para qualquer valor vindo de uma custom property.
 */
export function parseCssColor(
  input: string | null | undefined
): ColorTriplet | null {
  if (!input) return null;
  const value = input.trim().toLowerCase();
  if (!value) return null;
  if (value.startsWith("#")) return parseHex(value);

  const match = value.match(/^(oklch|oklab|rgba?|color)\(([^)]*)\)$/);
  if (!match) return null;

  const [, name, body] = match;
  const parts = body.split(/[\s,/]+/).filter(Boolean);

  if (name === "oklch") {
    return oklchToRgb(
      toNumber(parts[0], 1),
      toNumber(parts[1], 0.4),
      toNumber(parts[2], 360)
    );
  }

  if (name === "oklab") {
    return oklchToRgb(
      toNumber(parts[0], 1),
      Math.hypot(toNumber(parts[1], 0.4), toNumber(parts[2], 0.4)),
      (Math.atan2(toNumber(parts[2], 0.4), toNumber(parts[1], 0.4)) * 180) /
        Math.PI
    );
  }

  if (name === "color") {
    if (parts[0] !== "srgb") return null;
    return [toNumber(parts[1], 1), toNumber(parts[2], 1), toNumber(parts[3], 1)].map(
      clamp01
    ) as ColorTriplet;
  }

  return [
    toNumber(parts[0], 255) / 255,
    toNumber(parts[1], 255) / 255,
    toNumber(parts[2], 255) / 255,
  ].map(clamp01) as ColorTriplet;
}

let probeElement: HTMLElement | null = null;

function getProbeElement(): HTMLElement | null {
  if (typeof document === "undefined" || !document.body) return null;
  if (probeElement?.isConnected) return probeElement;

  probeElement = document.createElement("span");
  probeElement.setAttribute("aria-hidden", "true");
  probeElement.style.display = "none";
  document.body.appendChild(probeElement);
  return probeElement;
}

/**
 * Resolve qualquer cor CSS, inclusive `var(--token)`, para sRGB.
 *
 * A conversao e delegada ao navegador via `color-mix(in srgb, ...)`, que
 * devolve `color(srgb r g b)`. Reimplementar a conversao de lab()/oklch()
 * exigiria as matrizes CIE D50 -> D65, que sao faceis de errar. O fallback
 * tenta ler o valor cru, o que cobre hex, rgb(), oklch() e oklab().
 */
export function resolveCssColor(value: string): ColorTriplet | null {
  const probe = getProbeElement();
  if (probe) {
    probe.style.color = "";
    probe.style.color = `color-mix(in srgb, ${value} 100%, transparent)`;
    const computed = getComputedStyle(probe).color;
    const resolved = parseCssColor(computed);
    if (resolved) return resolved;
  }
  return parseCssColor(value);
}
