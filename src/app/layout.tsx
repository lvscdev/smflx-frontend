import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "SMFLX Registration Portal",
  description: "Register for WOTH Camp Meeting and other SMFLX events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full light">
      <body className="h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}