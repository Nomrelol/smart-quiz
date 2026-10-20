"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Trophy, Settings } from "@/components/Icons";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(5, 8, 20, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: "white",
              }}
            >
              Smart<span style={{ color: "#a78bfa" }}>Quiz</span>
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link href="/leaderboard" className={`nav-link ${pathname === "/leaderboard" ? "active" : ""}`}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Trophy size={14} />
              Leaderboard
            </span>
          </Link>
          <Link href="/admin" className={`nav-link ${pathname === "/admin" ? "active" : ""}`}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Settings size={14} />
              Admin
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
