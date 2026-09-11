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

export const metadata: Metadata = {
  title: "ThePathak.tech — Technology • Science • Code • Ideas • Words",
  description: "An independent editorial publishing platform focused on interpretation over repetition.",
  metadataBase: new URL("https://thepathak.tech"),
  openGraph: {
    title: "ThePathak.tech — Technology • Science • Code • Words",
    description: "Interpretation over repetition. Independent publishing platform.",
    url: "https://thepathak.tech",
    siteName: "ThePathak.tech",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable} ${firaCode.variable} ${devanagari.variable}`}>
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
