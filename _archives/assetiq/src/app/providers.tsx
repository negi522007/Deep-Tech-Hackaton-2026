"use client";
import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { useSmoothScroll } from "@/lib/motion";

function SmoothScroll({ children }: { children: ReactNode }) {
  useSmoothScroll();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return <StoreProvider><SmoothScroll>{children}</SmoothScroll></StoreProvider>;
}
