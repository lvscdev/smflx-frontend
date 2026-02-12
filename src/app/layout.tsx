import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Register for SMFLX'26",
  description: "Explore the SMFLX event schedule, registration, speakers, and engagement details for WOTH SMFLX 2026: designed for singles, married couples, families, and youth.",
  icons: {
    icon: "/assets/images/smflx_fav_icon.png",
    shortcut: "/assets/images/smflx_fav_icon.png",
    apple: "/assets/images/smflx_fav_icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
           <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
