import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | EduAI",
  description: "Your EduAI dashboard with credits and usage",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
