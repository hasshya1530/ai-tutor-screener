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

# Add backend directory to path for custom modules
sys.path.append(BASE_DIR)

from transcriber import transcribe_audio
from evaluator import evaluate_answer

load_dotenv()

app = FastAPI(
    title="AI Tutor Screener API",
    description="Voice-based tutor interview evaluation system",
    version="1.0.0"
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
    
    if difficulty not in ["Easy", "Medium", "Hard"]:
        raise HTTPException(status_code=400, detail="Difficulty must be Easy, Medium, or Hard")

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
async def evaluate_text_endpoint(
    answer: str = Form(...), 
    question_id: str = Form(...)
):
    qid = int(question_id)
    question_text = next((q["question"] for q in INTERVIEW_QUESTIONS if q["id"] == qid), None)
    
    if not question_text:
        raise HTTPException(status_code=404, detail="Question not found")
    
    evaluation = evaluate_answer(question_text, answer)
    
    return {
        "transcript": answer,
        "question": question_text,
        "question_id": qid,
        "evaluation": evaluation
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
    
    return {
        "transcript": transcript,
        "question": question_text,
        "question_id": qid,
        "evaluation": evaluation
    }

# ── SERVE REACT FRONTEND (MUST BE LAST) ──────────────────────────────────────

if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # List of API keywords to ignore so they don't accidentally serve HTML for a 404 API call
        # Added 'questions/add' here to ensure it's not swallowed by the UI router
        api_paths = ["questions", "questions/add", "health", "transcribe", "evaluate", "evaluate-text"]
        
        if any(full_path == path for path in api_paths) or full_path.startswith("api"):
             raise HTTPException(status_code=404)
        
        index_path = os.path.join(static_dir, "index.html")
        return FileResponse(index_path)
else:
    @app.get("/")
    def warn_no_ui():
        return {"error": "Frontend static files not found."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)