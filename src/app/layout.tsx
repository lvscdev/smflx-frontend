import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SMFLX",
  description: "SMFLX Front Office",
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
