from flask import Flask, request, redirect
import csv
import os

app = Flask(__name__)

# Function to load questions from CSV (as shown in PPT Slide 5)
def load_questions():
    # Default questions if file not present
    if not os.path.exists("questions.csv"):
        return [
            {"q": "which is used to join URL to function in flask?", "a": "@app.route", "b": "app.map()", "c": "url_for", "ans": "a"},
            {"q": "if __name__ == '__main__' means", "a": "File is not directed", "b": "Flask is install", "c": "Server is online", "ans": "c"},
            {"q": "which function is used to start flask server URL?", "a": "app.start()", "b": "app.run()", "c": "run(app)", "ans": "b"},
            {"q": "what does return '<p>Hello</p>' do?", "a": "show in Web Browser", "b": "save File", "c": "print in Terminal", "ans": "a"},
            {"q": "in which file we write Dependencies ?", "a": "package.json", "b": "requirements.txt", "c": "app.json", "ans": "b"},
        ]

    # Read CSV if present
    questions = []
    file = open("questions.csv", "r", encoding="utf-8")
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
    if not os.path.exists("leaderboard.csv"):
        return board
    f = open("leaderboard.csv", "r", encoding="utf-8")
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
    f = open("leaderboard.csv", "a", newline="", encoding="utf-8")
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
    html = ""
    for i in range(len(board)):
        if i < 5:
            html += f"<p style='margin: 8px 0; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 6px;'><b>{i+1}.</b> {board[i][0]} — <b>{board[i][1]}/{len(questions)}</b></p>"
    if html == "":
        html = "<p style='color: #94a3b8;'>no score yet</p>"

    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Quiz - Home</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; padding-top: 50px; margin: 0; min-height: 100vh;">
        <div style="background: #1e293b; padding: 32px; border-radius: 16px; width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 28px;">⚡</span>
                <h1 style="margin: 0; font-size: 28px;">Smart Quiz</h1>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px; margin-bottom: 24px;">Instant scoring & live leaderboard</p>
            <form method="POST">
                <input name="name" required placeholder="Enter your name" style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; font-size: 15px; margin-bottom: 16px;">
                <button style="width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer;">Start Quiz →</button>
            </form>
            <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
            <h3 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">🏆 Top 5 Leaderboard</h3>
            {html}
        </div>
    </body>
    </html>
    '''

# Quiz Route (as shown in PPT Slide 7 & 8)
@app.route("/quiz")
def quiz_page():
    global questions
    questions = load_questions()
    name = request.args.get("name", "Student")

    q_html = ""
    for i in range(len(questions)):
        q = questions[i]
        q_html += f'''
        <div style="margin-bottom: 20px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="margin-top: 0; font-weight: bold; font-size: 16px; color: #f8fafc;">Q{i+1}. {q['q']}</p>
            <label style="display: block; margin: 8px 0; cursor: pointer; padding: 6px; border-radius: 6px;">
                <input type="radio" name="q{i}" value="a" required style="accent-color: #2563eb;"> {q['a']}
            </label>
            <label style="display: block; margin: 8px 0; cursor: pointer; padding: 6px; border-radius: 6px;">
                <input type="radio" name="q{i}" value="b" style="accent-color: #2563eb;"> {q['b']}
            </label>
            <label style="display: block; margin: 8px 0; cursor: pointer; padding: 6px; border-radius: 6px;">
                <input type="radio" name="q{i}" value="c" style="accent-color: #2563eb;"> {q['c']}
            </label>
        </div>
        '''

    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Quiz - Questions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; padding: 30px 16px; margin: 0; min-height: 100vh;">
        <div style="background: #1e293b; padding: 32px; border-radius: 16px; width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 12px;">
                <h2 style="margin: 0; font-size: 20px;">Player: <span style="color: #60a5fa;">{name}</span></h2>
                <span style="background: #2563eb; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">{len(questions)} Questions</span>
            </div>
            <form method="POST" action="/submit">
                <input type="hidden" name="name" value="{name}">
                {q_html}
                <button style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px;">Submit Quiz ✓</button>
            </form>
        </div>
    </body>
    </html>
    '''

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

    html = ""
    for i in range(len(board)):
        is_current = (board[i][0] == name and board[i][1] == score)
        bg = "background: rgba(37,99,235,0.2); border: 1px solid #2563eb;" if is_current else "background: rgba(255,255,255,0.05);"
        medal = "🥇 " if i == 0 else "🥈 " if i == 1 else "🥉 " if i == 2 else f"{i+1}. "
        html += f"<p style='margin: 8px 0; padding: 8px 12px; {bg} border-radius: 6px;'><b>{medal}</b> {board[i][0]} — <b>{board[i][1]}/{len(questions)}</b></p>"

    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Quiz - Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; padding: 50px 16px; margin: 0; min-height: 100vh;">
        <div style="background: #1e293b; padding: 32px; border-radius: 16px; width: 440px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
            <h1 style="margin: 0; font-size: 26px;">{name}</h1>
            <div style="font-size: 36px; font-weight: bold; color: #60a5fa; margin: 12px 0;">{score} / {len(questions)}</div>
            <p style="color: #22c55e; font-weight: bold; font-size: 14px; margin-bottom: 20px;">✓ Saved to leaderboard.csv</p>
            <a href="/" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Play Again ↺</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 28px 0 20px 0;">
            <h3 style="margin-top: 0; text-align: left;">🏆 Full Leaderboard</h3>
            <div style="text-align: left; max-height: 250px; overflow-y: auto;">
                {html}
            </div>
        </div>
    </body>
    </html>
    '''

if __name__ == "__main__":
    print("Starting Smart Quiz Flask Server on http://127.0.0.1:5000 ...")
    app.run(debug=True)
