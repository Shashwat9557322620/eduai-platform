import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | EduAI",
  description: "EduAI Refund and Cancellation Policy",
};

export default function RefundPolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
