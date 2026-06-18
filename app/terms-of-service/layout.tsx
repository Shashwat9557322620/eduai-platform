import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | EduAI",
  description: "EduAI Terms of Service",
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
