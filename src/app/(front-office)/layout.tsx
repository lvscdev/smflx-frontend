import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SMFLX Registration Portal",
  description: "Register for WOTH Camp Meeting and other SMFLX events",
};

export default function FrontOfficeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
