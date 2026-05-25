import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Ye line tere app mein Clerk Engine ko bulati hai
import { ClerkProvider } from '@clerk/nextjs'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduAI | AI Study Arsenal",
  description: "Next-gen AI tools for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Yahan humne poori website ko ClerkProvider ke box mein pack kar diya
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}