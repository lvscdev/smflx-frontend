import "./globals.css";
import { Merriweather, Roboto } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SMFLX",
  description: "Event Management platform",
};

export const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
});

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${merriweather.variable} h-full`}
    >
      <body className="h-full bg-color font-body">
        <Toaster position="top-right" theme="dark" richColors />
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
