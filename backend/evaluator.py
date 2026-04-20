import os
import requests
import json
import re
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

def evaluate_answer(question: str, answer: str) -> dict:
    """
    Evaluates a candidate's transcript against pedagogical and soft-skill metrics.
    Handles edge cases like empty transcripts or API failures.
    """
    
    # ── EDGE CASE: EMPTY TRANSCRIPT ──
    clean_answer = answer.strip()
    if not clean_answer or len(clean_answer.split()) < 3:
        return _fallback_evaluation(
            "The candidate provided no substantial answer or the audio was too short to process.",
            verdict="Rejected"
        )

    # ── EDGE CASE: REFUSAL / "I DON'T KNOW" ──
    refusal_keywords = ["don't know", "skip", "no idea", "not sure", "don't understand"]
    if any(phrase in clean_answer.lower() for phrase in refusal_keywords) and len(clean_answer.split()) < 10:
        return _fallback_evaluation(
            "Candidate expressed inability to answer the question or lack of confidence.",
            verdict="Rejected"
        )

    if not GROQ_API_KEY:
        return _fallback_evaluation("System Error: GROQ_API_KEY not configured.")

    system_message = (
        "You are a senior pedagogical evaluator for Cuemath. "
        "Your goal is to screen tutor candidates based on how they explain math to children. "
        "You must respond ONLY with a structured JSON object. No conversational filler."
    )

    user_message = f"""Assess the following tutor candidate transcript.
    
    QUESTION: {question}
    TRANSCRIPT: {answer}

    Rubric Requirements:
    1. Simplicity: Ability to explain without complex jargon.
    2. Warmth: Tone and encouraging language.
    3. Patience: Willingness to re-explain or wait for the student.
    4. Clarity: Logical flow of the explanation.

    Return ONLY this JSON structure:
    {{
      "score": <overall_score_1_to_10>,
      "metrics": {{
        "simplicity": <1_to_10>,
        "warmth": <1_to_10>,
        "patience": <1_to_10>,
        "clarity": <1_to_10>
      }},
      "evidence_quotes": ["direct quote 1", "direct quote 2"],
      "strengths": "One sentence summary of what they did well.",
      "improvements": "One sentence of actionable advice.",
      "verdict": "Shortlisted/Maybe/Rejected"
    }}"""

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.1, # Low temperature for consistent JSON
        "response_format": { "type": "json_object" }
    }

    try:
        response = requests.post(
            GROQ_API_URL, 
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"}, 
            json=payload, 
            timeout=25
        )
        
        if response.status_code != 200:
            return _fallback_evaluation(f"Upstream API Error ({response.status_code})")

        raw_content = response.json()["choices"][0]["message"]["content"]
        return _safe_json_parse(raw_content)

    except Exception as e:
        return _fallback_evaluation(f"Internal Evaluation Error: {str(e)}")

def _safe_json_parse(raw_text: str) -> dict:
    """Attempts multiple strategies to extract valid JSON from LLM output."""
    raw_text = raw_text.strip()
    
    # Strategy 1: Direct Parse
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: Extract block between curly braces (handles LLM "chatter")
    match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            pass

    return _fallback_evaluation("The AI output could not be parsed into a structured report.")

def _fallback_evaluation(error_msg: str, verdict: str = "Error") -> dict:
    """Returns a valid schema even when evaluation fails."""
    return {
        "score": 0,
        "metrics": {"simplicity": 0, "warmth": 0, "patience": 0, "clarity": 0},
        "evidence_quotes": [],
        "strengths": "N/A",
        "improvements": error_msg,
        "verdict": verdict
    }