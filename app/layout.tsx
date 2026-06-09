import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Questory",
  description: "Interactive adventure experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0E0E0E] text-[#e5e2e1]">
        {children}
      </body>
    </html>
  );
}
