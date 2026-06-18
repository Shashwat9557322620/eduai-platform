import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | EduAI",
  description: "Frequently asked questions about EduAI and its AI-powered study tools.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
