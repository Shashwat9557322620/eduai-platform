import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import Providers from './Providers';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "EduAI | AI Study Arsenal",
  description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer powered by advanced AI.",
  keywords: ["AI", "study", "education", "flashcards", "curriculum", "skill gap", "learning", "edtech"],
  authors: [{ name: "EduAI" }],
  openGraph: {
    title: "EduAI | AI Study Arsenal",
    description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer.",
    type: "website",
    siteName: "EduAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduAI | AI Study Arsenal",
    description: "Next-gen AI tools for students — Curriculum Optimizer, Neural Flashcards, and Skill Gap Analyzer.",
  },
};

export const viewport: Viewport = {
  themeColor: "#020203",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
