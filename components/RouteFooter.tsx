"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function RouteFooter() {
  return usePathname() === "/" ? null : <Footer />;
}
