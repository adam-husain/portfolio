import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/portfolio/data/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
