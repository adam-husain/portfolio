"use client";

import { ReactNode } from "react";
import { LoadingProvider, LoadingScreen } from "./LoadingScreen";

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <LoadingProvider>
      <LoadingScreen />
      {children}
    </LoadingProvider>
  );
}
