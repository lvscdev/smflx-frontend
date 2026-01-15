import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMFLX Registration Portal",
  description: "Register for WOTH Camp Meeting and other SMFLX events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
