import "./globals.css";
import { Merriweather, Urbanist } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SMFLX",
  description: "Event Management platform",
};

export const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
});

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${merriweather.variable} h-full`}
    >
      <body className="h-full bg-color font-body">
        <Toaster position="top-right" theme="light" richColors />
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
