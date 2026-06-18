import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | EduAI",
  description: "Learn about EduAI - the AI-powered study platform built for students.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
