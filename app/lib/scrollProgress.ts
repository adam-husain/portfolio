"use client";

import { useSyncExternalStore } from "react";

// Module-level state for cross-section scroll progress awareness
interface ScrollProgressState {
  section2: number;
  section3: number;
  section4: number;
}

let globalState: ScrollProgressState = {
  section2: 0,
  section3: 0,
  section4: 0,
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

// Update functions for each section
export function updateSection2Progress(progress: number) {
  if (globalState.section2 !== progress) {
    globalState = { ...globalState, section2: progress };
    notifyListeners();
  }
}

export function updateSection3Progress(progress: number) {
  if (globalState.section3 !== progress) {
    globalState = { ...globalState, section3: progress };
    notifyListeners();
  }
}

export function updateSection4Progress(progress: number) {
  if (globalState.section4 !== progress) {
    globalState = { ...globalState, section4: progress };
    notifyListeners();
  }
}

// Hook to access scroll progress state
export function useScrollProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Utility function to map a value from one range to another
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number = 0,
  outMax: number = 1
): number {
  if (inMax === inMin) return outMin;
  const mapped = ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  return Math.max(outMin, Math.min(outMax, mapped));
}
