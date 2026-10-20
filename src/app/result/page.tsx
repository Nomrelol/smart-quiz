"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, ChevronRight, CheckCircle, XCircle, Home } from "@/components/Icons";

interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  name: string;
  category: string;
  difficulty: string;
  timeTaken: number;
  details: Array<{
    question_id: string;
    selected: string;
    correct: string;
    is_correct: boolean;
  }>;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  total: number;
  percentage: number;
  category: string;
  difficulty: string;
  time_taken: number | null;
}

const MEDALS = ["🥇", "🥈", "🥉"];

// Generate confetti pieces once at module load (outside render) to avoid
// react-hooks/purity violations from Math.random() inside components.
const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  color: ["#7c3aed", "#db2777", "#06b6d4", "#f59e0b", "#10b981"][i % 5],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 1.5}s`,
  duration: `${2 + Math.random() * 2}s`,
  size: `${6 + Math.random() * 8}px`,
  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
}));

function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <>
      {CONFETTI_PIECES.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.borderRadius,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    if (!raw) {
      router.push("/");
      return;
    }
    const parsed: QuizResult = JSON.parse(raw);
    setResult(parsed);
    if (parsed.percentage >= 70) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    fetch("/api/leaderboard?limit=10")
      .then((r) => r.json())
      .then(setLeaderboard)
      .catch(() => {});
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!result) return null;

  const pct = result.percentage;
  const grade =
    pct >= 90 ? { label: "S Rank", color: "#f59e0b", icon: "⭐" } :
    pct >= 75 ? { label: "A Rank", color: "#10b981", icon: "🎯" } :
    pct >= 60 ? { label: "B Rank", color: "#a78bfa", icon: "📚" } :
    pct >= 40 ? { label: "C Rank", color: "#60a5fa", icon: "💡" } :
               { label: "D Rank", color: "#ef4444", icon: "🔄" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <ConfettiBurst show={showConfetti} />

      {/* Score Hero */}
      <div
        className="glass-card"
        style={{ padding: "48px 36px", textAlign: "center", marginBottom: 32 }}
      >
        {/* Score circle */}
        <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 24px" }}>
          <svg width="160" height="160" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={grade.color}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.5s ease, stroke 0.5s" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: "50%",
              background: "var(--bg-primary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 800, color: grade.color }}>{pct}%</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {result.score}/{result.total}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: `${grade.color}20`,
            border: `1px solid ${grade.color}40`,
            borderRadius: 100,
            padding: "6px 18px",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 18 }}>{grade.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: grade.color }}>
            {grade.label}
          </span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          {pct >= 70
            ? `Great job, ${result.name}! 🎉`
            : `Nice try, ${result.name}!`}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 28 }}>
          You scored{" "}
          <strong style={{ color: "white" }}>
            {result.score} out of {result.total}
          </strong>{" "}
          in {result.category} ({result.difficulty})
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            padding: "20px 0 0",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>{result.score}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Correct</div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <XCircle size={18} color="#ef4444" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#ef4444" }}>
              {result.total - result.score}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Wrong</div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <Clock size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>{result.timeTaken}s</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Time Taken</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 36, justifyContent: "center" }}>
        <button
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => router.push("/")}
        >
          Play Again
          <ChevronRight size={18} style={{ position: "relative", zIndex: 1 }} />
        </button>
        <button
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => router.push("/leaderboard")}
        >
          <Trophy size={16} />
          Full Leaderboard
        </button>
        <button
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => router.push("/")}
        >
          <Home size={16} />
          Home
        </button>
      </div>

      {/* Leaderboard snippet */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Trophy size={20} color="#f59e0b" />
          Top Players
        </h2>
        {leaderboard.slice(0, 5).map((p, i) => {
          const isYou = p.name === result.name && i === leaderboard.findIndex(x => x.name === result.name);
          return (
            <div
              key={i}
              className={`lb-row ${i < 3 ? "lb-top" : ""}`}
              style={isYou ? { background: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.4)" } : {}}
            >
              <div style={{ fontSize: 20, minWidth: 30, textAlign: "center" }}>
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  {p.name}
                  {isYou && (
                    <span style={{ fontSize: 10, background: "#a78bfa", color: "white", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {p.category} · {p.difficulty}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#a78bfa" }}>
                  {p.score}/{p.total}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
