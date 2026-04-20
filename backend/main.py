# backend/main.py

import os
import sys
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Add backend directory to path
sys.path.append(os.path.dirname(__file__))

from transcriber import transcribe_audio
from evaluator import evaluate_answer

load_dotenv()

app = FastAPI(
    title="AI Tutor Screener API",
    description="Voice-based tutor interview evaluation system",
    version="1.0.0"
)

# Allow Streamlit frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── SAMPLE INTERVIEW QUESTIONS ────────────────────────────────────────────────
# backend/main.py  — find this section and replace it

# Make questions mutable so we can add custom ones
INTERVIEW_QUESTIONS = [
    {
        "id": 1,
        "subject": "Mathematics",
        "question": "A student keeps making mistakes when solving quadratic equations. "
                    "Walk me through exactly how you would explain the quadratic formula "
                    "to a 10th-grade student who is struggling with algebra.",
        "difficulty": "Medium"
    },
    {
        "id": 2,
        "subject": "Science",
        "question": "Explain the concept of photosynthesis to a 7th-grade student "
                    "who has never heard the term before. How would you make it "
                    "engaging and easy to remember?",
        "difficulty": "Easy"
    },
    {
        "id": 3,
        "subject": "Pedagogy",
        "question": "You have a classroom with students at three different learning "
                    "levels — advanced, average, and struggling. How would you structure "
                    "a 45-minute lesson so that all three groups stay engaged and learn?",
        "difficulty": "Hard"
    }
]

# Track next available ID
_next_id = 4
# ─────────────────────────────────────────────────────────────────────────────


# ── RESPONSE MODELS ───────────────────────────────────────────────────────────
class TranscribeResponse(BaseModel):
    transcript: str
    question_id: int
    question: str

class EvaluationResponse(BaseModel):
    transcript: str
    question: str
    evaluation: dict
# ─────────────────────────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {
        "status": "AI Tutor Screener API is running",
        "endpoints": [
            "GET  /questions        → list all questions",
            "GET  /questions/{id}   → get single question",
            "POST /transcribe       → audio file → text",
            "POST /evaluate         → audio + question → evaluation",
            "POST /evaluate-text    → text + question → evaluation (for testing)"
        ]
    }


@app.get("/health")
def health():
    """Render/Railway uses this to check if app is alive."""
    return {"status": "healthy"}


@app.get("/questions")
def get_questions():
    return {"questions": INTERVIEW_QUESTIONS}


@app.get("/questions/{question_id}")
def get_question(question_id: int):
    for q in INTERVIEW_QUESTIONS:
        if q["id"] == question_id:
            return q
    raise HTTPException(status_code=404, detail="Question not found")


@app.post("/questions/add")
async def add_question(
    subject: str = Form(...),
    question: str = Form(...),
    difficulty: str = Form("Medium")
):
    """
    Add a custom interview question.
    Difficulty must be: Easy / Medium / Hard
    """
    global _next_id, INTERVIEW_QUESTIONS

    if difficulty not in ["Easy", "Medium", "Hard"]:
        raise HTTPException(
            status_code=400,
            detail="Difficulty must be Easy, Medium, or Hard"
        )

    if len(question.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Question must be at least 20 characters"
        )

    new_question = {
        "id": _next_id,
        "subject": subject.strip(),
        "question": question.strip(),
        "difficulty": difficulty
    }

    INTERVIEW_QUESTIONS.append(new_question)
    _next_id += 1

    return {
        "message": "Question added successfully",
        "question": new_question,
        "total_questions": len(INTERVIEW_QUESTIONS)
    }


@app.delete("/questions/{question_id}")
async def delete_question(question_id: int):
    """Delete a custom question by ID. Cannot delete the 3 default questions."""
    global INTERVIEW_QUESTIONS

    if question_id <= 3:
        raise HTTPException(
            status_code=403,
            detail="Cannot delete the 3 default questions"
        )

    before = len(INTERVIEW_QUESTIONS)
    INTERVIEW_QUESTIONS = [q for q in INTERVIEW_QUESTIONS if q["id"] != question_id]

    if len(INTERVIEW_QUESTIONS) == before:
        raise HTTPException(status_code=404, detail="Question not found")

    return {"message": "Question deleted", "total_questions": len(INTERVIEW_QUESTIONS)}

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_endpoint(
    audio: UploadFile = File(...),
    question_id: int = Form(...)
):
    """
    Accepts audio file upload, returns transcribed text.
    Supports: wav, mp3, m4a, webm, ogg
    """
    
    # Validate question ID
    question_text = ""
    for q in INTERVIEW_QUESTIONS:
        if q["id"] == question_id:
            question_text = q["question"]
            break
    
    if not question_text:
        raise HTTPException(status_code=404, detail="Invalid question_id")
    
    # Validate file type
    allowed_types = {
        "audio/wav", "audio/wave", "audio/mpeg", "audio/mp4",
        "audio/webm", "audio/ogg", "video/webm"  # browsers send webm
    }
    
    # Read audio bytes
    audio_bytes = await audio.read()
    
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file received")
    
    # Detect extension from filename or content type
    filename = audio.filename or "audio.wav"
    extension = filename.rsplit(".", 1)[-1].lower()
    
    if extension not in ["wav", "mp3", "m4a", "webm", "ogg", "flac"]:
        extension = "wav"  # Default fallback
    
    try:
        transcript = transcribe_audio(audio_bytes, extension)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return TranscribeResponse(
        transcript=transcript,
        question_id=question_id,
        question=question_text
    )


@app.post("/evaluate")
async def evaluate_endpoint(
    audio: UploadFile = File(...),
    question_id: int = Form(...)
):
    """
    Full pipeline: audio → transcribe → evaluate.
    Returns transcript + structured evaluation.
    """
    
    # Get question
    question_text = ""
    for q in INTERVIEW_QUESTIONS:
        if q["id"] == question_id:
            question_text = q["question"]
            break
    
    if not question_text:
        raise HTTPException(status_code=404, detail="Invalid question_id")
    
    # Read audio
    audio_bytes = await audio.read()
    
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")
    
    filename = audio.filename or "audio.wav"
    extension = filename.rsplit(".", 1)[-1].lower()
    if extension not in ["wav", "mp3", "m4a", "webm", "ogg", "flac"]:
        extension = "wav"
    
    # Step 1: Transcribe
    try:
        transcript = transcribe_audio(audio_bytes, extension)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    
    # Step 2: Evaluate
    evaluation = evaluate_answer(question_text, transcript)
    
    return {
        "transcript": transcript,
        "question": question_text,
        "question_id": question_id,
        "evaluation": evaluation
    }


@app.post("/evaluate-text")
async def evaluate_text_endpoint(
    answer: str = Form(...),
    question_id: int = Form(1)
):
    """
    Text-only evaluation endpoint — useful for testing without audio.
    """
    question_text = ""
    for q in INTERVIEW_QUESTIONS:
        if q["id"] == question_id:
            question_text = q["question"]
            break
    
    if not question_text:
        raise HTTPException(status_code=404, detail="Invalid question_id")
    
    evaluation = evaluate_answer(question_text, answer)
    
    return {
        "transcript": answer,
        "question": question_text,
        "question_id": question_id,
        "evaluation": evaluation
    }


# Run directly for local dev
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# ── SERVE REACT FRONTEND ──────────────────────────────────────────────────────
# This serves the React build in production (Docker)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        """Catch-all route — serves React app for any non-API route."""
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend not built yet"}
# ─────────────────────────────────────────────────────────────────────────────