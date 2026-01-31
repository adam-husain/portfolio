"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";

// Module-level state (replaces React context)
interface LoadingState {
  isLoaded: boolean;
  progress: number;
  assetsReady: boolean;
  minTimeElapsed: boolean;
}

let globalState: LoadingState = {
  isLoaded: false,
  progress: 0,
  assetsReady: false,
  minTimeElapsed: false,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return globalState;
}

function updateState(updates: Partial<LoadingState>) {
  globalState = { ...globalState, ...updates };
  notifyListeners();
}

// Exported function to signal assets are ready
export function signalReady() {
  updateState({ assetsReady: true, progress: 100 });
}

// Hook to access loading state (replaces useContext)
export function useLoading() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    isLoaded: state.isLoaded,
    progress: state.progress,
  };
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
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [messages] = useState(() => shuffleArray(LOADING_MESSAGES));
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageState, setMessageState] = useState<"entering" | "visible" | "exiting">("entering");

  // Initialize loading timers (runs once on mount)
  useEffect(() => {
    // Remove the SSR blocker now that React has hydrated
    const blocker = document.getElementById("initial-loading-blocker");
    if (blocker) {
      blocker.remove();
    }

    const progressInterval = setInterval(() => {
      if (globalState.progress < 90) {
        updateState({ progress: globalState.progress + Math.random() * 12 });
      }
    }, 150);

    const timer = setTimeout(() => {
      updateState({ minTimeElapsed: true, progress: 100 });
      clearInterval(progressInterval);
    }, 1400);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  // Complete loading when conditions are met
  useEffect(() => {
    if ((state.assetsReady || state.minTimeElapsed) && state.minTimeElapsed && !state.isLoaded) {
      const timer = setTimeout(() => {
        updateState({ isLoaded: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.assetsReady, state.minTimeElapsed, state.isLoaded]);

  // Lock scroll during loading
  useEffect(() => {
    if (!state.isLoaded) {
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
  }, [state.isLoaded]);

  // Smoothly animate progress number
  useEffect(() => {
    const target = Math.min(state.progress, 100);
    const animate = () => {
      setDisplayProgress((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.12;
      });
    };
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [state.progress]);

  // Message cycling
  useEffect(() => {
    if (state.isLoaded) return;

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
  }, [state.isLoaded, messages.length]);

  // Reveal animation when loaded
  useEffect(() => {
    if (state.isLoaded && containerRef.current && contentRef.current && !isHidden) {
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
  }, [state.isLoaded, isHidden]);

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
      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-6 md:gap-8 px-6">
        {/* Rotating message */}
        <div className="h-6 overflow-hidden">
          <p
            className="text-white/50 text-sm md:text-sm tracking-wide text-center transition-all duration-400 ease-out max-w-[85vw]"
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
        <div className="w-40 md:w-48 h-px bg-white/10 rounded-full overflow-hidden">
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
