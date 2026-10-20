"use client";

import { useEffect, useState } from "react";
import { Trophy, Clock, Filter, Trash2 } from "@/components/Icons";

interface LeaderboardEntry {
  name: string;
  score: number;
  total: number;
  percentage: number;
  category: string;
  difficulty: string;
  time_taken: number | null;
  timestamp: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

function formatTime(seconds: number | null) {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [clearing, setClearing] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/leaderboard?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        const cats = ["All", ...new Set(data.map((e: LeaderboardEntry) => e.category))].filter(Boolean);
        setCategories(cats as string[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const filtered = entries.filter((e) => {
    if (filterDiff !== "All" && e.difficulty !== filterDiff) return false;
    if (filterCat !== "All" && e.category !== filterCat) return false;
    return true;
  });

  const handleClear = async () => {
    if (!confirm("Clear the entire leaderboard? This cannot be undone.")) return;
    setClearing(true);
    await fetch("/api/leaderboard", { method: "DELETE" });
    setEntries([]);
    setClearing(false);
  };

  const diffColor: Record<string, string> = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 16,
          }}
        >
          <Trophy size={14} color="#f59e0b" />
          <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>
            Hall of Fame
          </span>
        </div>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 8,
          }}
        >
          <span className="gradient-text-gold">Leaderboard</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Top performers ranked by score percentage, then by speed.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: "16px 24px", marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
            <Filter size={14} />
            Filter:
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                className={`tab-btn ${filterDiff === d ? "active" : ""}`}
                onClick={() => setFilterDiff(d)}
                style={
                  filterDiff === d && d !== "All"
                    ? {
                        background: `${diffColor[d]}20`,
                        borderColor: `${diffColor[d]}50`,
                        color: diffColor[d],
                      }
                    : {}
                }
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ height: 20, width: 1, background: "var(--border)" }} />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                key={c}
                className={`tab-btn ${filterCat === c ? "active" : ""}`}
                onClick={() => setFilterCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            className="btn-danger"
            onClick={handleClear}
            disabled={clearing}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Trash2 size={14} />
            {clearing ? "Clearing…" : "Clear"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 100px 100px 100px 120px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}
        >
          <span>Rank</span>
          <span>Player</span>
          <span style={{ textAlign: "center" }}>Score</span>
          <span style={{ textAlign: "center" }}>%</span>
          <span style={{ textAlign: "center" }}>Time</span>
          <span style={{ textAlign: "right" }}>Date</span>
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center" }}>
            <Trophy size={48} style={{ opacity: 0.2, margin: "0 auto 16px", display: "block" }} />
            <p style={{ color: "var(--text-muted)", fontSize: 16 }}>No entries yet.</p>
          </div>
        ) : (
          filtered.map((entry, i) => {
            const isTop = i < 3;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 100px 100px 100px 120px",
                  padding: "14px 20px",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: isTop ? "rgba(124,58,237,0.05)" : "transparent",
                  transition: "background 0.2s",
                }}
                className="lb-table-row"
              >
                <span style={{ fontSize: 20 }}>
                  {i < 3 ? MEDALS[i] : <span style={{ color: "var(--text-muted)", fontSize: 14 }}>#{i + 1}</span>}
                </span>

                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                    {entry.name}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background: "rgba(124,58,237,0.15)",
                        color: "#a78bfa",
                        fontWeight: 600,
                      }}
                    >
                      {entry.category}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background: `${diffColor[entry.difficulty] || "#a78bfa"}20`,
                        color: diffColor[entry.difficulty] || "#a78bfa",
                        fontWeight: 600,
                      }}
                    >
                      {entry.difficulty}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "center", fontWeight: 700, color: "#a78bfa" }}>
                  {entry.score}/{entry.total}
                </div>

                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        entry.percentage >= 80
                          ? "#10b981"
                          : entry.percentage >= 60
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {entry.percentage}%
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={12} />
                  {formatTime(entry.time_taken)}
                </div>

                <div
                  style={{
                    textAlign: "right",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {formatDate(entry.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .lb-table-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>
    </div>
  );
}
