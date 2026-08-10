import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const APP_LANG = "en";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Well with Katarina",
  description: "Your daily plan, weekly list and reference material in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={APP_LANG} className={inter.variable}>
      <body className="min-h-dvh bg-surface-canvas font-body text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
