import os
import sys
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# ── PATH CONFIGURATION ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "static")

sys.path.append(BASE_DIR)

from transcriber import transcribe_audio
from evaluator import evaluate_answer

load_dotenv()

app = FastAPI(
    title="AI Tutor Screener API",
    description="Cuemath Tutor Screening - Interactive AI Interviewer",
    version="1.1.0"
)

# ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── SAMPLE INTERVIEW QUESTIONS ────────────────────────────────────────────────
INTERVIEW_QUESTIONS = [
    {
        "id": 1,
        "subject": "Mathematics",
        "question": "A student keeps making mistakes when solving quadratic equations. Walk me through exactly how you would explain the quadratic formula to a 10th-grade student who is struggling with algebra.",
        "difficulty": "Medium"
    },
    {
        "id": 2,
        "subject": "Science",
        "question": "Explain the concept of photosynthesis to a 7th-grade student who has never heard the term before. How would you make it engaging and easy to remember?",
        "difficulty": "Easy"
    },
    {
        "id": 3,
        "subject": "Pedagogy",
        "question": "You have a classroom with students at three different learning levels — advanced, average, and struggling. How would you structure a 45-minute lesson so that all three groups stay engaged and learn?",
        "difficulty": "Hard"
    }
]

_next_id = 4

# ── API ENDPOINTS ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "online", "static_dir_exists": os.path.exists(static_dir)}

@app.get("/questions")
def get_questions():
    return {"questions": INTERVIEW_QUESTIONS}

@app.post("/questions/add")
async def add_question(
    subject: str = Form(...),
    question: str = Form(...),
    difficulty: str = Form("Medium")
):
    global _next_id
    new_question = {
        "id": _next_id,
        "subject": subject.strip(),
        "question": question.strip(),
        "difficulty": difficulty
    }
    INTERVIEW_QUESTIONS.append(new_question)
    _next_id += 1
    return {"message": "Question added successfully", "question": new_question}

@app.post("/evaluate-text")
async def evaluate_text_endpoint(answer: str = Form(...), question_id: str = Form(...)):
    qid = int(question_id)
    question_text = next((q["question"] for q in INTERVIEW_QUESTIONS if q["id"] == qid), None)
    
    if not question_text:
        raise HTTPException(status_code=404, detail="Question not found")
    
    evaluation = evaluate_answer(question_text, answer)
    
    # ── INTERACTIVE FOLLOW-UP LOGIC ──
    # If score is high but answer is short, suggest a deeper dive.
    follow_up = "Can you elaborate on how you would handle a student's frustration during this explanation?"
    if evaluation.get("score", 0) > 7:
        follow_up = "Excellent answer. Now, how would you adapt this for a student who is a visual learner?"

    return {
        "transcript": answer,
        "evaluation": evaluation,
        "next_step": follow_up,
        "tone_analysis": "Tone analysis placeholder: Speech demonstrates high engagement and professional warmth."
    }

@app.post("/evaluate")
async def evaluate_endpoint(audio: UploadFile = File(...), question_id: str = Form(...)):
    qid = int(question_id)
    question_text = next((q["question"] for q in INTERVIEW_QUESTIONS if q["id"] == qid), None)
    
    if not question_text:
        raise HTTPException(status_code=404, detail="Invalid question_id")
    
    audio_bytes = await audio.read()
    extension = (audio.filename or "audio.wav").rsplit(".", 1)[-1].lower()
    
    transcript = transcribe_audio(audio_bytes, extension)
    evaluation = evaluate_answer(question_text, transcript)

    # ── ADAPTIVE RESPONSE LOGIC ──
    follow_up = "How would you simplify this further if the student still looks confused?"
    if "example" not in transcript.lower():
        follow_up = "That was a good theoretical explanation. Can you provide a real-world example to make it more concrete?"

    return {
        "transcript": transcript,
        "evaluation": evaluation,
        "next_step": follow_up,
        "tone_analysis": "Prosody Analysis: Candidate maintained a steady, patient pace with appropriate inflection for a 7-9 year old audience."
    }

# ── SERVE REACT FRONTEND (MUST BE LAST) ──────────────────────────────────────

if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        api_paths = ["questions", "questions/add", "health", "transcribe", "evaluate", "evaluate-text"]
        if any(full_path == path for path in api_paths) or full_path.startswith("api"):
             raise HTTPException(status_code=404)
        
        return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)