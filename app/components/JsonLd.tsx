import { siteConfig, socialLinks } from "@/lib/site";

export default function JsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: siteConfig.currentJob.title,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.currentJob.company,
    },
    description: siteConfig.bio,
    url: siteConfig.url,
    knowsAbout: [
      ...siteConfig.skills.languages,
      ...siteConfig.skills.frontend,
      ...siteConfig.skills.backend,
      ...siteConfig.skills.cloud,
      ...siteConfig.skills.ml,
    ],
    sameAs: [socialLinks.linkedin, socialLinks.github],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${siteConfig.name} Portfolio`,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
