import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");

function loadQuestions() {
  return JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf-8"));
}

function loadLeaderboard() {
  if (!fs.existsSync(LEADERBOARD_FILE)) return [];
  return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf-8"));
}

function saveLeaderboard(data: object[]) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { player_name, answers, category, difficulty, time_taken } = body;

  const questions = loadQuestions();
  const answerMap: Record<string, string> = {};
  questions.forEach((q: { id: number; answer: string }) => {
    answerMap[String(q.id)] = q.answer;
  });

  let score = 0;
  const total = Object.keys(answers).length;
  const details: object[] = [];

  for (const [qid, selected] of Object.entries(answers)) {
    const correct = answerMap[qid];
    const isCorrect = selected === correct;
    if (isCorrect) score++;
    details.push({ question_id: qid, selected, correct, is_correct: isCorrect });
  }

  const percentage = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;

  const leaderboard = loadLeaderboard();
  leaderboard.push({
    name: player_name,
    score,
    total,
    percentage,
    category: category || "All",
    difficulty: difficulty || "All",
    time_taken: time_taken || null,
    timestamp: new Date().toISOString(),
  });
  saveLeaderboard(leaderboard);

  return NextResponse.json({ score, total, percentage, details });
}
