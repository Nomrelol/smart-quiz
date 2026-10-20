"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Clock, CheckCircle, XCircle, ChevronRight, Loader } from "@/components/Icons";

interface Question {
  id: number;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];
const TIMER_SECONDS = 30;

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") || "Player";
  const category = searchParams.get("category") || "All";
  const difficulty = searchParams.get("difficulty") || "All";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load questions
  useEffect(() => {
    const params = new URLSearchParams({ limit: "10" });
    if (category !== "All") params.set("category", category);
    if (difficulty !== "All") params.set("difficulty", difficulty);

    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, difficulty]);

  const submitQuiz = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (submitting) return;
      setSubmitting(true);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);

      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player_name: name,
            answers: finalAnswers,
            category,
            difficulty,
            time_taken: timeTaken,
          }),
        });
        const result = await res.json();
        // Save result to sessionStorage for result page
        sessionStorage.setItem(
          "quizResult",
          JSON.stringify({ ...result, name, category, difficulty, timeTaken })
        );
        router.push("/result");
      } catch {
        setSubmitting(false);
      }
    },
    [name, category, difficulty, startTime, router, submitting]
  );

  // Auto-advance on timer
  const handleNext = useCallback(() => {
    const q = questions[current];
    if (!q) return;

    const newAnswers = { ...answers };
    if (selected) newAnswers[String(q.id)] = selected;

    const isLast = current === questions.length - 1;
    if (isLast) {
      submitQuiz(newAnswers);
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setCurrent((c) => c + 1);
      setTimeLeft(TIMER_SECONDS);
    }
  }, [questions, current, answers, selected, submitQuiz]);

  // Timer
  useEffect(() => {
    if (loading || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleNext();
          return TIMER_SECONDS;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [loading, current, questions.length, handleNext]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          gap: 16,
        }}
      >
        <Loader size={40} color="#a78bfa" style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Loading your quiz…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <XCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No Questions Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          No questions match your selected category/difficulty.
        </p>
        <button className="btn-primary" onClick={() => router.push("/")}>
          Go Back Home
        </button>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 15 ? "#10b981" : timeLeft > 8 ? "#f59e0b" : "#ef4444";
  const diffColors: Record<string, string> = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
            Playing as <strong style={{ color: "#a78bfa" }}>{name}</strong>
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Question {current + 1} of {questions.length}
          </p>
        </div>

        {/* Timer ring */}
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={timerColor}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerPct / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s, stroke 0.5s" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Clock size={12} color={timerColor} />
            <span style={{ fontSize: 14, fontWeight: 700, color: timerColor }}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 32 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <div className="glass-card" style={{ padding: 36 }}>
        {/* Category & Difficulty */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 100,
              background: "rgba(124,58,237,0.15)",
              color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {q.category}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 100,
              background: `${diffColors[q.difficulty] || "#a78bfa"}20`,
              color: diffColors[q.difficulty] || "#a78bfa",
              border: `1px solid ${diffColors[q.difficulty] || "#a78bfa"}40`,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {q.difficulty}
          </span>
        </div>

        {/* Question text */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: 28,
            color: "var(--text-primary)",
          }}
        >
          {q.question}
        </h2>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === opt;
            return (
              <button
                key={opt}
                className={`option-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelected(opt)}
                style={{ textAlign: "left", background: "none", border: undefined, cursor: "pointer" }}
              >
                <span
                  className="option-letter"
                  style={
                    isSelected
                      ? { background: "var(--accent-purple)", color: "white" }
                      : {}
                  }
                >
                  {OPTION_LETTERS[i]}
                </span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{opt}</span>
                {isSelected && (
                  <CheckCircle
                    size={18}
                    color="#a78bfa"
                    style={{ marginLeft: "auto", flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={submitting}
            style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140, justifyContent: "center" }}
          >
            {submitting ? (
              "Submitting…"
            ) : current === questions.length - 1 ? (
              "Submit Quiz"
            ) : (
              <>
                Next <ChevronRight size={18} style={{ position: "relative", zIndex: 1 }} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background:
                i === current
                  ? "#a78bfa"
                  : answers[String(questions[i].id)]
                  ? "rgba(124,58,237,0.4)"
                  : "rgba(255,255,255,0.1)",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>Loading…</div>}>
      <QuizContent />
    </Suspense>
  );
}
