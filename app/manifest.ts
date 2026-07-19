import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} | ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#150400",
    theme_color: "#150400",
    icons: [
      {
        src: "/favicon-ah.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
