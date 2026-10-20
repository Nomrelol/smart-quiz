import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADERBOARD_FILE = path.join(process.cwd(), "data", "leaderboard.json");

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

function loadLeaderboard(): LeaderboardEntry[] {
  if (!fs.existsSync(LEADERBOARD_FILE)) return [];
  return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf-8"));
}

function saveLeaderboard(data: LeaderboardEntry[]) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const leaderboard = loadLeaderboard();
  const sorted = [...leaderboard].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    const ta = a.time_taken ?? 9999;
    const tb = b.time_taken ?? 9999;
    return ta - tb;
  });

  return NextResponse.json(sorted.slice(0, limit));
}

export async function DELETE() {
  saveLeaderboard([]);
  return NextResponse.json({ message: "Leaderboard cleared" });
}
