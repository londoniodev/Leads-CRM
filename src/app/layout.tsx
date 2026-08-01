import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel CRM - Lead Generator B2B",
  description: "Plataforma de gestión e inteligencia de prospectos B2B extraídos y enriquecidos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className={`${poppins.className} min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
