"use client";

import { useState, useEffect, useCallback } from "react";
import { TYPEWRITER_TIMING } from "@/app/lib/animationTiming";

interface TypewriterTextProps {
  words: string[];
  className?: string;
}

type Phase = "typing" | "pausing" | "deleting" | "selecting_next";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TypewriterText({
  words,
  className,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [wordQueue, setWordQueue] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Initialize word queue on mount
  useEffect(() => {
    setWordQueue(shuffleArray(words));
  }, [words]);

  // Get current target word
  const getCurrentWord = useCallback(() => {
    return wordQueue[currentWordIndex] || "";
  }, [wordQueue, currentWordIndex]);

  // Main typing/deleting effect
  useEffect(() => {
    if (wordQueue.length === 0) return;

    const currentWord = getCurrentWord();
    let timeoutId: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing":
        if (displayText.length < currentWord.length) {
          timeoutId = setTimeout(() => {
            setDisplayText(currentWord.slice(0, displayText.length + 1));
          }, TYPEWRITER_TIMING.typeSpeed);
        } else {
          // Word fully typed, pause before deleting
          setPhase("pausing");
        }
        break;

      case "pausing":
        timeoutId = setTimeout(() => {
          setPhase("deleting");
        }, TYPEWRITER_TIMING.pauseAfterType);
        break;

      case "deleting":
        if (displayText.length > 0) {
          timeoutId = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1));
          }, TYPEWRITER_TIMING.deleteSpeed);
        } else {
          // Word fully deleted, select next word
          setPhase("selecting_next");
        }
        break;

      case "selecting_next":
        timeoutId = setTimeout(() => {
          const nextIndex = currentWordIndex + 1;
          if (nextIndex >= wordQueue.length) {
            // Reshuffle and restart
            setWordQueue(shuffleArray(words));
            setCurrentWordIndex(0);
          } else {
            setCurrentWordIndex(nextIndex);
          }
          setPhase("typing");
        }, TYPEWRITER_TIMING.pauseAfterDelete);
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    phase,
    displayText,
    wordQueue,
    currentWordIndex,
    words,
    getCurrentWord,
  ]);

  const shouldBlink = phase === "pausing";

  return (
    <span className={className}>
      {displayText}
      <span className={shouldBlink ? "typewriter-cursor" : ""}>▌</span>
    </span>
  );
}
