import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");

function loadQuestions() {
  return JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf-8"));
}

function saveQuestions(questions: object[]) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const questions = loadQuestions();
  const idx = questions.findIndex((q: { id: number }) => q.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  questions[idx] = { ...questions[idx], ...body };
  saveQuestions(questions);
  return NextResponse.json(questions[idx]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questions = loadQuestions();
  const newQ = questions.filter((q: { id: number }) => q.id !== parseInt(id));
  if (newQ.length === questions.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  saveQuestions(newQ);
  return NextResponse.json({ message: "Deleted" });
}
