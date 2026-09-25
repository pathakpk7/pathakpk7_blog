import type { Metadata } from "next";
import { Inter, Newsreader, Fira_Code, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

const devanagari = Noto_Serif_Devanagari({
  weight: ["400", "700"],
  subsets: ["devanagari"],
  variable: "--font-devanagari",
});

import { getBaseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "ThePathak.tech — Technology • Science • Code • Ideas • Words",
    template: "%s | ThePathak.tech",
  },
  description: "An independent editorial publishing platform focused on interpretation over repetition.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ThePathak.tech — Technology • Science • Code • Words",
    description: "Interpretation over repetition. Independent publishing platform.",
    url: getBaseUrl(),
    siteName: "ThePathak.tech",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/emblem.png",
        width: 1024,
        height: 1024,
        type: "image/png",
        alt: "ThePathak.tech Logo",
      },
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "ThePathak.tech Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ThePathak.tech — Technology • Science • Code • Words",
    description: "Interpretation over repetition. Independent publishing platform.",
    images: ["/emblem.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable} ${firaCode.variable} ${devanagari.variable}`}>
      <body suppressHydrationWarning className="antialiased selection:bg-blue-500 selection:text-white">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
