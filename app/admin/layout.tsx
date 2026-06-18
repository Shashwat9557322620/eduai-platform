import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Overlord | EduAI",
  description: "Admin dashboard for EduAI platform management",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
