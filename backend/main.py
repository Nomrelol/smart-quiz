from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import random
from datetime import datetime

app = FastAPI(title="Smart Quiz API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_FILE = os.path.join(BASE_DIR, "data", "questions.json")
LEADERBOARD_FILE = os.path.join(BASE_DIR, "data", "leaderboard.json")


# ─── Data helpers ────────────────────────────────────────────────────────────

def load_questions() -> list:
    with open(QUESTIONS_FILE, "r") as f:
        return json.load(f)

def save_questions(questions: list):
    with open(QUESTIONS_FILE, "w") as f:
        json.dump(questions, f, indent=2)

def load_leaderboard() -> list:
    with open(LEADERBOARD_FILE, "r") as f:
        return json.load(f)

def save_leaderboard(data: list):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ─── Pydantic models ─────────────────────────────────────────────────────────

class QuestionCreate(BaseModel):
    question: str
    options: List[str]
    answer: str
    category: str
    difficulty: str

class QuestionUpdate(BaseModel):
    question: Optional[str] = None
    options: Optional[List[str]] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None

class SubmitAnswers(BaseModel):
    player_name: str
    answers: dict  # {question_id: selected_answer}
    category: Optional[str] = None
    difficulty: Optional[str] = None
    time_taken: Optional[int] = None  # seconds


# ─── Questions routes ─────────────────────────────────────────────────────────

@app.get("/api/questions")
def get_questions(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 10
):
    questions = load_questions()
    
    if category and category != "All":
        questions = [q for q in questions if q["category"].lower() == category.lower()]
    if difficulty and difficulty != "All":
        questions = [q for q in questions if q["difficulty"].lower() == difficulty.lower()]
    
    # Shuffle and limit
    random.shuffle(questions)
    questions = questions[:limit]
    
    # Remove answer before sending to frontend
    return [
        {
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
            "category": q["category"],
            "difficulty": q["difficulty"],
        }
        for q in questions
    ]


@app.get("/api/questions/all")
def get_all_questions_admin():
    """Admin: get all questions with answers"""
    return load_questions()


@app.get("/api/categories")
def get_categories():
    questions = load_questions()
    categories = list(set(q["category"] for q in questions))
    return sorted(categories)


@app.get("/api/difficulties")
def get_difficulties():
    return ["Easy", "Medium", "Hard"]


@app.post("/api/questions")
def create_question(q: QuestionCreate):
    questions = load_questions()
    new_id = max((x["id"] for x in questions), default=0) + 1
    new_q = {"id": new_id, **q.dict()}
    questions.append(new_q)
    save_questions(questions)
    return new_q


@app.put("/api/questions/{question_id}")
def update_question(question_id: int, update: QuestionUpdate):
    questions = load_questions()
    for i, q in enumerate(questions):
        if q["id"] == question_id:
            for field, value in update.dict(exclude_none=True).items():
                questions[i][field] = value
            save_questions(questions)
            return questions[i]
    raise HTTPException(status_code=404, detail="Question not found")


@app.delete("/api/questions/{question_id}")
def delete_question(question_id: int):
    questions = load_questions()
    new_questions = [q for q in questions if q["id"] != question_id]
    if len(new_questions) == len(questions):
        raise HTTPException(status_code=404, detail="Question not found")
    save_questions(new_questions)
    return {"message": "Question deleted"}


# ─── Quiz submission ──────────────────────────────────────────────────────────

@app.post("/api/submit")
def submit_quiz(submission: SubmitAnswers):
    questions = load_questions()
    
    # Build a lookup: id -> answer
    answer_map = {str(q["id"]): q["answer"] for q in questions}
    
    score = 0
    total = len(submission.answers)
    details = []
    
    for qid, selected in submission.answers.items():
        correct = answer_map.get(qid)
        is_correct = selected == correct
        if is_correct:
            score += 1
        details.append({
            "question_id": qid,
            "selected": selected,
            "correct": correct,
            "is_correct": is_correct,
        })
    
    percentage = round((score / total) * 100, 1) if total > 0 else 0
    
    # Save to leaderboard
    leaderboard = load_leaderboard()
    entry = {
        "name": submission.player_name,
        "score": score,
        "total": total,
        "percentage": percentage,
        "category": submission.category or "All",
        "difficulty": submission.difficulty or "All",
        "time_taken": submission.time_taken,
        "timestamp": datetime.utcnow().isoformat(),
    }
    leaderboard.append(entry)
    save_leaderboard(leaderboard)
    
    return {
        "score": score,
        "total": total,
        "percentage": percentage,
        "details": details,
    }


# ─── Leaderboard routes ───────────────────────────────────────────────────────

@app.get("/api/leaderboard")
def get_leaderboard(limit: int = 50):
    leaderboard = load_leaderboard()
    # Sort by percentage desc, then by time_taken asc (faster = better)
    sorted_lb = sorted(
        leaderboard,
        key=lambda x: (-x["percentage"], x.get("time_taken") or 9999)
    )
    return sorted_lb[:limit]


@app.get("/api/leaderboard/top")
def get_top_leaderboard(limit: int = 5):
    return get_leaderboard(limit=limit)


@app.delete("/api/leaderboard")
def clear_leaderboard():
    save_leaderboard([])
    return {"message": "Leaderboard cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
