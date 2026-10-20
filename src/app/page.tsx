"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, Zap, Clock, BookOpen,
  ChevronRight, Star, Users, Target
} from "@/components/Icons";

const API = "";

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

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(["All", ...data]))
      .catch(() => setCategories(["All"]));

    fetch(`${API}/api/leaderboard?limit=5`)
      .then((r) => r.json())
      .then(setTopPlayers)
      .catch(() => setTopPlayers([]));
  }, []);

  const handleStart = () => {
    if (!name.trim()) return;
    setLoading(true);
    const params = new URLSearchParams({
      name: name.trim(),
      category,
      difficulty,
    });
    router.push(`/quiz?${params.toString()}`);
  };

  const difficultyColor: Record<string, string> = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
    All: "#a78bfa",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
      {/* Hero section */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 24,
          }}
        >
          <Zap size={14} color="#a78bfa" />
          <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>
            Real-time Scoring · Live Leaderboard · Timed Rounds
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(42px, 6vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 20,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Test Your <span className="gradient-text">Knowledge</span>
          <br />
          Beat the <span className="gradient-text-gold">Leaderboard</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Answer questions, race the clock, and claim your spot at the top.
          Choose your category and difficulty to get started.
        </p>
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "start",
        }}
        className="home-grid"
      >
        {/* START QUIZ CARD */}
        <div className="glass-card" style={{ padding: 36 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Target size={22} color="#a78bfa" />
            Start Quiz
          </h2>

          {/* Player name */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Your Name
            </label>
            <input
              className="quiz-input"
              type="text"
              placeholder="Enter your name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Category
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`category-chip ${category === cat ? "selected" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Difficulty
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${difficulty === d ? difficultyColor[d] : "var(--border)"}`,
                    background: difficulty === d ? `${difficultyColor[d]}20` : "transparent",
                    color: difficulty === d ? difficultyColor[d] : "var(--text-secondary)",
                    transition: "all 0.2s",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onClick={handleStart}
            disabled={!name.trim() || loading}
          >
            {loading ? "Starting…" : "Start Quiz"}
            <ChevronRight size={18} style={{ position: "relative", zIndex: 1 }} />
          </button>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginTop: 28,
              paddingTop: 28,
              borderTop: "1px solid var(--border)",
            }}
          >
            {[
              { icon: <BookOpen size={16} />, label: "Questions", value: "15+" },
              { icon: <Clock size={16} />, label: "Per Question", value: "30s" },
              { icon: <Users size={16} />, label: "Players", value: String(topPlayers.length * 3 + 12) },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ color: "#a78bfa", display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEADERBOARD TOP 5 */}
        <div className="glass-card" style={{ padding: 36 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Trophy size={22} color="#f59e0b" />
            Top Players
          </h2>

          {topPlayers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "var(--text-muted)",
              }}
            >
              <Star size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
              <p style={{ fontSize: 15 }}>No scores yet.</p>
              <p style={{ fontSize: 13 }}>Be the first to play!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topPlayers.map((p, i) => (
                <div
                  key={i}
                  className={`lb-row ${i < 3 ? "lb-top" : ""}`}
                >
                  <div style={{ fontSize: 22, minWidth: 32, textAlign: "center" }}>
                    {i < 3 ? MEDALS[i] : <span style={{ color: "var(--text-muted)", fontSize: 16 }}>#{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {p.category} · {p.difficulty}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
                      {p.score}/{p.total}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {p.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-secondary"
            style={{ width: "100%", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onClick={() => router.push("/leaderboard")}
          >
            View Full Leaderboard
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .home-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
