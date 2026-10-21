from flask import Flask, redirect, render_template, request
import csv
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_FILE = os.path.join(BASE_DIR, "questions.csv")
LEADERBOARD_FILE = os.path.join(BASE_DIR, "leaderboard.csv")


# Function to load questions from CSV (as shown in PPT Slide 5)
def load_questions():
    # Default questions if file not present
    if not os.path.exists(QUESTIONS_FILE):
        return [
            {"q": "which is used to join URL to function in flask?", "a": "@app.route", "b": "app.map()", "c": "url_for", "ans": "a"},
            {"q": "if __name__ == '__main__' means", "a": "File is not directed", "b": "Flask is install", "c": "Server is online", "ans": "c"},
            {"q": "which function is used to start flask server URL?", "a": "app.start()", "b": "app.run()", "c": "run(app)", "ans": "b"},
            {"q": "what does return '<p>Hello</p>' do?", "a": "sends HTML", "b": "print in Terminal", "c": "save File", "ans": "a"},
            {"q": "in which file we write Dependencies ?", "a": "main.py", "b": "requirements.txt", "c": "app.json", "ans": "b"},
        ]

    # Read CSV if present
    questions = []
    file = open(QUESTIONS_FILE, "r", encoding="utf-8")
    reader = csv.DictReader(file)
    for row in reader:
        q = {}
        q["q"] = row["q"].strip()
        q["a"] = row["a"].strip()
        q["b"] = row["b"].strip()
        q["c"] = row["c"].strip()
        q["ans"] = row["ans"].strip().lower()
        questions.append(q)
    file.close()
    return questions


questions = load_questions()


# Load Leaderboard (as shown in PPT Slide 6)
def load_board():
    board = []
    if not os.path.exists(LEADERBOARD_FILE):
        return board
    f = open(LEADERBOARD_FILE, "r", encoding="utf-8")
    reader = csv.reader(f)
    for row in reader:
        if len(row) == 2:
            try:
                board.append([row[0], int(row[1])])
            except ValueError:
                continue
    f.close()
    board.sort(key=lambda x: x[1], reverse=True)
    return board


# Save Leaderboard (as shown in PPT Slide 6)
def save_board(name, score):
    f = open(LEADERBOARD_FILE, "a", newline="", encoding="utf-8")
    writer = csv.writer(f)
    writer.writerow([name, score])
    f.close()


# Home Route (as shown in PPT Slide 7 & 8)
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        name = request.form.get("name", "Student").strip()
        if not name:
            name = "Student"
        return redirect("/quiz?name=" + name)

    board = load_board()
    return render_template("index.html", board=board[:5], total=len(questions))


# Quiz Route (as shown in PPT Slide 7 & 8)
@app.route("/quiz")
def quiz_page():
    global questions
    questions = load_questions()
    name = request.args.get("name", "Student")
    return render_template("quiz.html", name=name, questions=questions)


# Submit Route (as shown in PPT Slide 8 & 9)
@app.route("/submit", methods=["POST"])
def submit_page():
    name = request.form.get("name", "Student")
    score = 0
    for i in range(len(questions)):
        user_answer = request.form.get(f"q{i}")
        correct_answer = questions[i]["ans"]
        if user_answer == correct_answer:
            score = score + 1

    save_board(name, score)
    board = load_board()
    total = len(questions)
    percentage = round((score / total) * 100) if total else 0

    return render_template(
        "result.html",
        name=name,
        score=score,
        total=total,
        board=board,
        percentage=percentage,
    )


if __name__ == "__main__":
    print("Starting Smart Quiz Flask Server on http://127.0.0.1:5000 ...")
    app.run(debug=True)
