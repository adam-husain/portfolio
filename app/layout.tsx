import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LoadingOverlay from "./components/LoadingOverlay";
import JsonLd from "./components/JsonLd";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Adam Husain | Software Engineer & Creative Designer",
  description:
    "Adam Husain is a Software Engineer and Creative Designer with expertise in Web/Mobile Development, Machine Learning, and Cloud Technologies. Explore his journey from freelance work to leading tech teams.",
  keywords: [
    "Adam Husain",
    "Software Engineer",
    "AI Specialist",
    "Full Stack Developer",
    "Machine Learning",
    "React",
    "TypeScript",
    "Python",
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
    title: "Adam Husain | Software Engineer & Creative Designer",
    description:
      "Software Engineer and Creative Designer crafting innovative digital experiences.",
    siteName: "Adam Husain Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Husain | Software Engineer & Creative Designer",
    description:
      "Software Engineer and Creative Designer crafting innovative digital experiences.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="prefetch" href="/assets/rocket.glb" as="fetch" crossOrigin="anonymous" />
        <JsonLd />
      </head>
      <body
        className={`${raleway.variable} ${raleway.className} antialiased`}
      >
        {/* Immediate SSR blocker - prevents flash before JS hydrates */}
        <div
          id="initial-loading-blocker"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "linear-gradient(to bottom, #000000 0%, #0a0a14 50%, #000814 100%)",
          }}
        />
        <LoadingOverlay />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
