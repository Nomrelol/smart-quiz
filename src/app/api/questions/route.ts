import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");

function loadQuestions() {
  const raw = fs.readFileSync(QUESTIONS_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveQuestions(questions: object[]) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const limit = parseInt(searchParams.get("limit") || "10");
  const admin = searchParams.get("admin");

  let questions = loadQuestions();

  if (category && category !== "All") {
    questions = questions.filter(
      (q: { category: string }) => q.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (difficulty && difficulty !== "All") {
    questions = questions.filter(
      (q: { difficulty: string }) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  questions = questions.slice(0, limit);

  // Remove answer unless admin
  if (!admin) {
    questions = questions.map(
      (q: { id: number; question: string; options: string[]; category: string; difficulty: string }) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
      })
    );
  }

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const questions = loadQuestions();
  const newId = Math.max(0, ...questions.map((q: { id: number }) => q.id)) + 1;
  const newQuestion = { id: newId, ...body };
  questions.push(newQuestion);
  saveQuestions(questions);
  return NextResponse.json(newQuestion);
}
