import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import JsonLd from "./components/JsonLd";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Adam Husain | Software Engineer",
  description: siteConfig.description,
  keywords: [
    "Adam Husain",
    "Software Engineer",
    "AI Engineer",
    "Full Stack Developer",
    "Mobile Developer",
    "Machine Learning",
    "React",
    "Next.js",
    "TypeScript",
    "Python",
    "TEDx Speaker",
  ],
  authors: [{ name: "Adam Husain" }],
  creator: "Adam Husain",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Adam Husain | Software Engineer",
    description: siteConfig.description,
    siteName: "Adam Husain Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Husain | Software Engineer",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#150400",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${bricolage.variable} ${instrumentSans.variable} ${spaceGrotesk.variable} ${instrumentSans.className} antialiased`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
