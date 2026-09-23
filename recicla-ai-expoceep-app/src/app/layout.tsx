import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SquiCircleFilter } from "@/components/ui/squi-circle-filter";
import { Header } from "@/components/dashboard/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { PointsProvider } from "@/contexts/points-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      </body>
    </html>
  );
}
