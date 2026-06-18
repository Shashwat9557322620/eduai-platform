import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | EduAI",
  description: "Insights, tutorials, and updates from the EduAI team.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
