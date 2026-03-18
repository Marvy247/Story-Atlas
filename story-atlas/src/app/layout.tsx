import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://storyatlas.xyz';

export const metadata: Metadata = {
  title: "Story Atlas - IP Relationship Explorer",
  description: "Interactive visualization of Story Protocol IP assets, derivatives, and licensing relationships",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "Story Atlas - IP Relationship Explorer",
    description: "Explore Story Protocol IP assets, derivative chains, and licensing relationships as an interactive force-directed graph.",
    url: APP_URL,
    siteName: "Story Atlas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Story Atlas - IP Relationship Explorer",
    description: "Explore Story Protocol IP assets, derivative chains, and licensing relationships as an interactive force-directed graph.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
