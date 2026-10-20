# Smart Quiz with Leaderboard (Flask + CSV)

**Mini Project by:** Prabudh Gautam & Kartik Sharma  
**Matching Presentation:** `Smart quiz application PRABUDH.pptx`

---

## 🚀 How to Run the Flask Application

### 1. Activate Environment & Run
Open your terminal inside this project folder:

```bash
# If using the provided virtual environment:
/Users/nomrelol/Desktop/Kartik/venv/bin/python app.py

# Or if you have Flask installed in your standard python:
python3 app.py
```

The server will start on: **`http://127.0.0.1:5000`**

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## 📁 Project Structure (Oriented to PPT)

- **`app.py`**: Core Flask web server containing all routes and functions matching Slides 5–9:
  - `load_questions()`: Reads `questions.csv` (Slide 5)
  - `load_board()` & `save_board()`: Manages `leaderboard.csv` (Slide 6)
  - `@app.route("/")`: Home page with Name input & Top 5 players (Slide 7)
  - `@app.route("/quiz")`: Quiz page with radio buttons (Slide 7 & 8)
  - `@app.route("/submit")`: Instant evaluation & score saving (Slide 8 & 9)
  - `app.run(debug=True)`: Starts server (Slide 9)
- **`questions.csv`**: Editable CSV file containing quiz questions (`q,a,b,c,ans`) (Slide 3 & 5)
- **`leaderboard.csv`**: CSV file storing player names and scores (`name,score`) (Slide 3 & 6)
- **`requirements.txt`**: Python dependencies (`flask>=3.0.0`) (Slide 10)

---

## 🌿 Git Branches

- **`main`**: The full-stack Next.js 16 + React + TypeScript version.
- **`flask-version`** *(Current)*: The exact Python Flask + CSV version matching the presentation.
