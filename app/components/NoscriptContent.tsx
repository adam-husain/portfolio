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
              <h3>Machine Learning</h3>
              <ul>
                {siteConfig.skills.ml.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>
          </article>

          <article>
            <h2>Current Role</h2>
            <p>
              {siteConfig.currentJob.title} at {siteConfig.currentJob.company}
            </p>
          </article>

          <article>
            <h2>Projects</h2>
            {siteConfig.projects.map((project) => (
              <section key={project.name}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <p>Built with: {project.technologies.join(", ")}</p>
              </section>
            ))}
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
