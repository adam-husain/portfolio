"use client";

import dynamic from "next/dynamic";

const LoadingScreen = dynamic(
  () => import("./LoadingScreen").then((m) => ({ default: m.LoadingScreen })),
  { ssr: false }
);

export default function LoadingOverlay() {
  return <LoadingScreen />;
}
