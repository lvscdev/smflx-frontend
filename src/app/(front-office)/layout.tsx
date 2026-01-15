import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMFLX Registration Portal",
  description: "Register for WOTH Camp Meeting and other SMFLX events",
};

export default function FrontOfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="front-office h-full">
      <div className="flex h-full w-full">
        {children}
      </div>
    </div>
  );
}
