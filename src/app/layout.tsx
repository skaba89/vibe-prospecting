import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe Prospecting - AI-Powered B2B Lead Generation",
  description: "Find your perfect prospects with AI conversation. Simply describe your ideal customer and let AI find the best companies and contacts for your business.",
  keywords: ["B2B prospecting", "lead generation", "AI prospecting", "sales intelligence", "company search", "contact discovery"],
  authors: [{ name: "Vibe Prospecting" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Vibe Prospecting - AI-Powered B2B Lead Generation",
    description: "Find your perfect prospects with AI conversation.",
    url: "https://vibeprospecting.ai",
    siteName: "Vibe Prospecting",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Prospecting",
    description: "AI-Powered B2B Lead Generation",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
