import { siteConfig, socialLinks } from "@/lib/site";

export default function NoscriptContent() {
  const currentYear = new Date().getFullYear();

  return (
    <noscript>
      <div className="noscript-fallback">
        <header>
          <h1>{siteConfig.name}</h1>
          <p className="noscript-tagline">{siteConfig.tagline}</p>
        </header>

        <main>
          <article>
            <h2>About</h2>
            <p>{siteConfig.bio}</p>
          </article>

          <article>
            <h2>Current Role</h2>
            <p>
              {siteConfig.currentJob.title} at {siteConfig.currentJob.company}
            </p>
          </article>

          <article>
            <h2>Career Projects</h2>
            {siteConfig.careerProjects.map((project) => (
              <section key={project.slug}>
                <h3>
                  {project.name} ({project.year})
                </h3>
                <p>{project.role}</p>
                <p>{project.description}</p>
                <p>Built with: {project.technologies.join(", ")}</p>
                {project.link && (
                  <p>
                    <a href={project.link}>{project.link}</a>
                  </p>
                )}
              </section>
            ))}
          </article>

          <article>
            <h2>More Projects</h2>
            {siteConfig.cvProjects.map((project) => (
              <section key={project.slug}>
                <h3>
                  {project.name} ({project.year})
                </h3>
                <p>{project.description}</p>
                <p>Built with: {project.technologies.join(", ")}</p>
              </section>
            ))}
          </article>

          <article>
            <h2>TEDx Talk</h2>
            <p>
              {siteConfig.tedTalk.title} ({siteConfig.tedTalk.event}, 2022)
            </p>
            <p>{siteConfig.tedTalk.description}</p>
            <p>
              <a href={siteConfig.tedTalk.url}>Watch on YouTube</a>
            </p>
          </article>

          <article>
            <h2>Education</h2>
            {siteConfig.education.map((edu) => (
              <section key={edu.degree}>
                <h3>
                  {edu.degree}, {edu.institution}
                </h3>
                <p>{edu.period}</p>
              </section>
            ))}
          </article>

          <article>
            <h2>Technical Skills</h2>
            <section>
              <h3>Languages</h3>
              <ul>
                {siteConfig.skills.languages.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Frontend</h3>
              <ul>
                {siteConfig.skills.frontend.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Mobile</h3>
              <ul>
                {siteConfig.skills.mobile.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Backend</h3>
              <ul>
                {siteConfig.skills.backend.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Cloud & DevOps</h3>
              <ul>
                {siteConfig.skills.cloud.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>AI & Machine Learning</h3>
              <ul>
                {siteConfig.skills.ml.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
          </article>
        </main>

        <footer>
          <h2>Connect</h2>
          <nav aria-label="Social links">
            <a href={socialLinks.linkedin}>LinkedIn</a>
            <a href={socialLinks.github}>GitHub</a>
          </nav>
          <p>
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </footer>
      </div>
    </noscript>
  );
}
