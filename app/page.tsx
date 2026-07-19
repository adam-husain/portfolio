import HeroSection from "./components/HeroSection";
import CareerProjectsSection from "./components/CareerProjectsSection";
import CvProjectsSection from "./components/CvProjectsSection";
import TedTalkSection from "./components/TedTalkSection";
import ExperienceSection from "./components/ExperienceSection";
import SkillsSection from "./components/SkillsSection";
import FooterSection from "./components/FooterSection";
import NoscriptContent from "./components/NoscriptContent";

export default function Home() {
  return (
    <>
      {/* Skip link for keyboard / assistive-tech users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-secondary"
      >
        Skip to main content
      </a>

      <main id="main-content">
        <HeroSection />
        <CareerProjectsSection />
        <CvProjectsSection />
        <TedTalkSection />
        <ExperienceSection />
        <SkillsSection />
      </main>

      <FooterSection />
      <NoscriptContent />
    </>
  );
}
