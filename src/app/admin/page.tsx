"use client";

import { useEffect, useState } from "react";
import {
  Plus, Edit2, Trash2, Save, X, BookOpen,
  ChevronDown, ChevronUp, Database
} from "@/components/Icons";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: string;
  difficulty: string;
}

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const OPTION_LETTERS = ["A", "B", "C", "D"];

const emptyForm = (): Omit<Question, "id"> => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
  category: "",
  difficulty: "Easy",
});

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/questions?admin=1&limit=100")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const categories = ["All", ...new Set(questions.map((q) => q.category))].filter(Boolean);

  const filtered = questions.filter((q) => {
    if (filterCat !== "All" && q.category !== filterCat) return false;
    if (filterDiff !== "All" && q.difficulty !== filterDiff) return false;
    return true;
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (q: Question) => {
    setEditId(q.id);
    setForm({
      question: q.question,
      options: [...q.options],
      answer: q.answer,
      category: q.category,
      difficulty: q.difficulty,
    });
    setShowForm(true);
    setExpandedId(null);
  };

  const handleSave = async () => {
    if (!form.question.trim() || form.options.some((o) => !o.trim()) || !form.answer || !form.category.trim()) {
      alert("Please fill all fields.");
      return;
    }
    if (!form.options.includes(form.answer)) {
      alert("The correct answer must be one of the options.");
      return;
    }

    setSaving(true);
    try {
      if (editId !== null) {
        await fetch(`/api/questions/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    setDeleting(id);
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  const diffColor: Record<string, string> = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 12,
            }}
          >
            <Database size={14} color="#a78bfa" />
            <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>Admin Panel</span>
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: 4,
            }}
          >
            Question <span className="gradient-text">Manager</span>
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {questions.length} questions across {categories.length - 1} categories
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}
        >
          <Plus size={18} style={{ position: "relative", zIndex: 1 }} />
          Add Question
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: 32, marginBottom: 28, border: "1px solid rgba(124,58,237,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              {editId ? "Edit Question" : "Add New Question"}
            </h2>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Question text */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Question *
            </label>
            <textarea
              className="quiz-input"
              rows={2}
              placeholder="Enter the question…"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Answer Options *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                  <input
                    className="quiz-input"
                    style={{ padding: "10px 14px" }}
                    placeholder={`Option ${OPTION_LETTERS[i]}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...form.options];
                      newOpts[i] = e.target.value;
                      setForm({ ...form, options: newOpts });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Correct answer, category, difficulty */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Correct Answer *
              </label>
              <select
                className="quiz-input"
                style={{ padding: "10px 14px" }}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              >
                <option value="">Select…</option>
                {form.options.filter(Boolean).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Category *
              </label>
              <input
                className="quiz-input"
                style={{ padding: "10px 14px" }}
                placeholder="e.g. Science"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Difficulty *
              </label>
              <select
                className="quiz-input"
                style={{ padding: "10px 14px" }}
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Save size={16} style={{ position: "relative", zIndex: 1 }} />
              {saving ? "Saving…" : editId ? "Update Question" : "Add Question"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 4 }}>Filter:</span>
        {categories.map((c) => (
          <button
            key={c}
            className={`tab-btn ${filterCat === c ? "active" : ""}`}
            onClick={() => setFilterCat(c)}
          >
            {c}
          </button>
        ))}
        <div style={{ height: 20, width: 1, background: "var(--border)", margin: "0 4px" }} />
        {["All", "Easy", "Medium", "Hard"].map((d) => (
          <button
            key={d}
            className={`tab-btn ${filterDiff === d ? "active" : ""}`}
            onClick={() => setFilterDiff(d)}
          >
            {d}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
          {filtered.length} questions
        </span>
      </div>

      {/* Questions list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          Loading questions…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px" }}>
          <BookOpen size={48} style={{ opacity: 0.2, margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 16 }}>No questions found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className="glass-card"
                style={{ padding: 0, overflow: "hidden" }}
              >
                {/* Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <span
                    style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {q.id}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {q.question}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
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
                        {q.category}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 100,
                          background: `${diffColor[q.difficulty]}20`,
                          color: diffColor[q.difficulty],
                          fontWeight: 600,
                        }}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                      onClick={(e) => { e.stopPropagation(); openEdit(q); }}
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                      disabled={deleting === q.id}
                    >
                      <Trash2 size={12} />
                      {deleting === q.id ? "…" : "Del"}
                    </button>
                    <div style={{ color: "var(--text-muted)" }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      padding: "16px 20px 20px",
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 8,
                            background:
                              opt === q.answer
                                ? "rgba(16,185,129,0.12)"
                                : "rgba(255,255,255,0.03)",
                            border:
                              opt === q.answer
                                ? "1px solid rgba(16,185,129,0.3)"
                                : "1px solid var(--border)",
                          }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background:
                                opt === q.answer ? "#10b981" : "rgba(255,255,255,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color: opt === q.answer ? "white" : "var(--text-muted)",
                              flexShrink: 0,
                            }}
                          >
                            {OPTION_LETTERS[i]}
                          </span>
                          <span style={{ fontSize: 13, color: opt === q.answer ? "#34d399" : "var(--text-secondary)" }}>
                            {opt}
                          </span>
                          {opt === q.answer && (
                            <span style={{ marginLeft: "auto", fontSize: 10, color: "#34d399", fontWeight: 700 }}>
                              ✓ CORRECT
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
