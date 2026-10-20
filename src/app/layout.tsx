import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Smart Quiz — Compete, Learn, Win",
  description: "A premium interactive quiz app with real-time scoring, leaderboards, timers, and multiple categories. Built with Next.js + FastAPI.",
  keywords: "quiz, smart quiz, leaderboard, trivia, competition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Animated background orbs */}
        <div className="animated-bg">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>

        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main style={{ position: "relative", zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
