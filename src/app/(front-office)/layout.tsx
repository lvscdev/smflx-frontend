import { ThemeProvider } from "@/components/theme-provider";

export default function FrontOfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}