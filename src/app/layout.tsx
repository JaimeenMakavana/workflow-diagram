import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mermaid Workflow Generator",
  description: "Create beautiful workflow diagrams with Mermaid syntax. Real-time rendering, validation, and export to PNG/SVG.",
  keywords: ["mermaid", "workflow", "diagram", "flowchart", "generator", "nextjs"],
  authors: [{ name: "Mermaid Workflow Generator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
