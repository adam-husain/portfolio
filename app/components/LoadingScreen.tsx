"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import gsap from "gsap";

interface LoadingContextType {
  isLoaded: boolean;
  progress: number;
  signalReady: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoaded: false,
  progress: 0,
  signalReady: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Direct signal that everything is ready
  const signalReady = useCallback(() => {
    setAssetsReady(true);
    setProgress(100);
  }, []);

  // Minimum loading time for smoother UX
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 12;
      });
    }, 150);

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
      clearInterval(progressInterval);
      setProgress(100);
    }, 1400);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  // Complete loading when all conditions met
  useEffect(() => {
    if ((assetsReady || minTimeElapsed) && minTimeElapsed && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [assetsReady, minTimeElapsed, isLoaded]);

  // Lock scroll during loading
  useEffect(() => {
    if (!isLoaded) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isLoaded]);

  return (
    <LoadingContext.Provider value={{ isLoaded, progress, signalReady }}>
      {children}
    </LoadingContext.Provider>
  );
}

const LOADING_MESSAGES = [
  "Creativity is coming your way",
  "Story-telling through a website",
  "This website is open-source",
  "Inspired by this website? Drop me an email",
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LoadingScreen() {
  const { isLoaded, progress } = useLoading();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [messages] = useState(() => shuffleArray(LOADING_MESSAGES));
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageState, setMessageState] = useState<"entering" | "visible" | "exiting">("entering");

  // Smoothly animate progress number
  useEffect(() => {
    const target = Math.min(progress, 100);
    const animate = () => {
      setDisplayProgress((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.12;
      });
    };
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [progress]);

  // Message cycling
  useEffect(() => {
    if (isLoaded) return;

    // Initial enter animation
    const enterTimeout = setTimeout(() => {
      setMessageState("visible");
    }, 50);

    // Start the cycle
    const cycleMessages = () => {
      // Exit current message
      setMessageState("exiting");

      // After exit animation, show next message
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setMessageState("entering");

        // Trigger enter animation
        setTimeout(() => {
          setMessageState("visible");
        }, 50);
      }, 400);
    };

    const interval = setInterval(cycleMessages, 3000);

    return () => {
      clearTimeout(enterTimeout);
      clearInterval(interval);
    };
  }, [isLoaded, messages.length]);

  // Reveal animation when loaded
  useEffect(() => {
    if (isLoaded && containerRef.current && contentRef.current && !isHidden) {
      const tl = gsap.timeline({
        onComplete: () => setIsHidden(true),
      });

      // Fade out content
      tl.to(contentRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });

      // Split reveal - two halves slide apart
      tl.to(
        containerRef.current,
        {
          clipPath: "inset(50% 0 50% 0)",
          duration: 0.7,
          ease: "power3.inOut",
        },
        "-=0.1"
      );
    }
  }, [isLoaded, isHidden]);

  if (isHidden) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        clipPath: "inset(0 0 0 0)",
        background: "linear-gradient(to bottom, #000000 0%, #0a0a14 50%, #000814 100%)",
      }}
    >
      {/* Subtle stars */}
      <div className="absolute inset-0 overflow-hidden opacity-40" aria-hidden="true">
        <div className="stars-small absolute inset-0 bg-repeat" />
        <div className="stars-medium absolute inset-0 bg-repeat" />
      </div>

      {/* Loading content */}
      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-8">
        {/* Rotating message */}
        <div className="h-6 overflow-hidden">
          <p
            className="text-white/50 text-sm tracking-wide text-center transition-all duration-400 ease-out"
            style={{
              transform: messageState === "entering"
                ? "translateY(100%)"
                : messageState === "exiting"
                ? "translateY(-100%)"
                : "translateY(0)",
              opacity: messageState === "visible" ? 1 : 0,
            }}
          >
            {messages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-px bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Percentage */}
        <p className="text-white/30 text-xs tracking-[0.3em] uppercase tabular-nums">
          {Math.round(displayProgress)}%
        </p>
      </div>
    </div>
  );
}
