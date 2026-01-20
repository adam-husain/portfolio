import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import LoadingOverlay from "./components/LoadingOverlay";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
  openGraph: {
    type: "website",
    locale: "en_US",
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
        <link rel="prefetch" href="/assets/rocket-draco.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/draco/draco_decoder.wasm" as="fetch" crossOrigin="anonymous" />
      </head>
      <body
        className={`${raleway.variable} ${raleway.className} antialiased`}
      >
        <LoadingOverlay />
        {children}
      </body>
    </html>
  );
}
