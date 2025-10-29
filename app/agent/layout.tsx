import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to Raf | AI Agent",
  description: "An interactive layer of Raf's mind. Ask about work, process, and design philosophy.",
};

export default function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
