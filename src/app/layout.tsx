import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { env } from "@/lib/env";
import { Providers } from "./providers";
import "./globals.css";

const APP_LANG = "en";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Well with Katarina",
  description: "Your daily plan, weekly list and reference material in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={APP_LANG}
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-dvh bg-surface-canvas font-body text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
