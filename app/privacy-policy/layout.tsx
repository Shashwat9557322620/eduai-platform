import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EduAI",
  description: "EduAI Privacy Policy - How we handle your data",
};

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
