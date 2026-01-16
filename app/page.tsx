import EyeTrackerBall from "./components/EyeTrackerBall";

export default function Home() {
  return (
    <>
      <section
        className="relative min-h-screen min-h-dvh flex items-center justify-center overflow-hidden"
        aria-label="Introduction"
      >
        {/* Animated star background */}
        <div className="absolute inset-0 bg-background" aria-hidden="true">
          <div className="stars-small absolute inset-0 bg-repeat animate-twinkle" />
          <div className="stars-medium absolute inset-0 bg-repeat animate-twinkle-delayed" />
          <div className="stars-large absolute inset-0 bg-repeat animate-twinkle-slow" />
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-[90vw]">
          <p className="text-white text-sm sm:text-base lg:text-lg tracking-[0.2em] uppercase mb-3 font-medium">
            Hello, I&apos;m
          </p>
          <h1 className="text-primary uppercase text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-4 lg:-tracking-wide">
            Adam Husain
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl font-normal flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1 sm:gap-2">
            <span>Software Engineer</span>
            <span className="hidden sm:inline text-primary/60" aria-hidden="true">|</span>
            <span>AI Specialist</span>
          </p>
        </div>
      </section>

      {/* Image cursor tracker - positioned at bottom, half visible */}
      <EyeTrackerBall />

      {/* Noscript fallback for SEO */}
      <noscript>
        <div className="noscript-content">
          <h1>Adam Husain</h1>
          <p>Software Engineer | AI Specialist</p>
          <p>
            Experienced software engineer specializing in web and mobile development,
            machine learning, and cloud technologies. Currently working at Nation.dev,
            building innovative digital experiences with React, TypeScript, and modern
            web technologies.
          </p>
        </div>
      </noscript>
    </>
  );
}
