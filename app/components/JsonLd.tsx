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
    image: `${siteConfig.url}/images/mine/profile.jpg`,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Monash University",
    },
    knowsAbout: [
      ...siteConfig.skills.languages,
      ...siteConfig.skills.frontend,
      ...siteConfig.skills.mobile,
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

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${siteConfig.tedTalk.title} | ${siteConfig.name} | ${siteConfig.tedTalk.event}`,
    description: siteConfig.tedTalk.description,
    uploadDate: siteConfig.tedTalk.date,
    thumbnailUrl: `${siteConfig.url}/images/ted-thumbnail.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${siteConfig.tedTalk.youtubeId}`,
    url: siteConfig.tedTalk.url,
  };

  const projectListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name}'s Career Projects`,
    itemListElement: siteConfig.careerProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.name,
        description: project.description,
        ...(project.link ? { url: project.link } : {}),
      },
    })),
  };

  return (
    <>
      {[personSchema, webSiteSchema, videoSchema, projectListSchema].map(
        (schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        )
      )}
    </>
  );
}
