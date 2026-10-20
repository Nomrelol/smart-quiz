import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const QUESTIONS_FILE = path.join(process.cwd(), "data", "questions.json");

export async function GET() {
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf-8"));
  const categories = [...new Set(questions.map((q: { category: string }) => q.category))].sort();
  return NextResponse.json(categories);
}
