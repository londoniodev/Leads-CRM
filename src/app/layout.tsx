import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
