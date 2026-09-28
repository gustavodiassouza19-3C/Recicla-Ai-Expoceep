import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { SquiCircleFilter } from "@/components/ui/squi-circle-filter";
import { Header } from "@/components/dashboard/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { PointsProvider } from "@/contexts/points-context";
import { MotionProvider } from "@/components/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// A variavel precisa de um nome proprio. Antes era `--font-geist-sans`, mas o
// globals.css mapeava `--font-sans: var(--font-sans)`, auto-referencia que
// computava para vazio: os tokens de fonte estavam mortos e editar o CSS nao
// mudava nada. O mono continua Geist Mono para dado tabular, que e uso legitimo
// de monospace (codigo, dado, medicao) e nao como figurino.
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recicla Ai",
  description: "Sistema digital para incentivar a reciclagem urbana",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <SquiCircleFilter />
        <MotionProvider>
          <AuthProvider>
            <PointsProvider>
              <Header />
              <main className="flex-1 pt-2">
                {children}
              </main>
              <Footer />
              <Toaster position="bottom-right" richColors closeButton />
            </PointsProvider>
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
