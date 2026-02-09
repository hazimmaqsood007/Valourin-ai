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

export const metadata: Metadata = {
  title: {
    default: "ValourinAI - AI-Powered Travel Planning & Holiday Packages",
    template: "%s | ValourinAI"
  },
  description: "Discover your dream vacation with ValourinAI. AI-powered travel planning, curated holiday packages, and personalized itineraries for beaches, mountains, cities, and more. Book your perfect trip today!",
  keywords: ["travel", "holiday packages", "AI travel planner", "vacation booking", "destinations", "travel booking", "ValourinAI", "Valourin", "trip planning", "beach holidays", "mountain trips", "city tours"],
  authors: [{ name: "ValourinAI" }],
  creator: "ValourinAI",
  publisher: "ValourinAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://valourin-ai.vercel.app",
    siteName: "ValourinAI",
    title: "ValourinAI - AI-Powered Travel Planning & Holiday Packages",
    description: "Discover your dream vacation with ValourinAI. AI-powered travel planning, curated holiday packages, and personalized itineraries.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ValourinAI - AI Travel Planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ValourinAI - AI-Powered Travel Planning",
    description: "Discover your dream vacation with AI-powered travel planning and curated holiday packages.",
    images: ["/og-image.jpg"],
    creator: "@ValourinAI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
