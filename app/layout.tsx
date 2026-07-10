import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider, SignInButton, Show } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Sparkles } from "lucide-react";
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
  title: "Life OS | Dashboard",
  description: "Tu sistema personal para trading, finanzas, salud y progreso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#030303] text-white">
          <Show when="signed-out">
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-5 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%)]" />

              <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-2xl">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Life OS
                    </h1>
                    <p className="text-sm text-white/40">Sistema personal</p>
                  </div>
                </div>

                <p className="mb-3 text-sm text-white/40">Acceso privado</p>

                <h2 className="text-4xl font-bold tracking-tight">
                  Entra a tu dashboard
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  Usa Google o tu correo para entrar. Tus datos actuales siguen
                  guardándose en tu navegador mientras hacemos la versión con
                  base de datos.
                </p>

                <SignInButton mode="redirect">
                  <button className="mt-8 w-full rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-white/90">
                    Iniciar sesión / Crear cuenta
                  </button>
                </SignInButton>

                <p className="mt-5 text-xs leading-relaxed text-white/35">
                 Después conectamos base de datos para guardar todo en
                  la nube.
                </p>
              </section>
            </main>
          </Show>

          <Show when="signed-in">{children}</Show>
        </body>
      </html>
    </ClerkProvider>
  );
}