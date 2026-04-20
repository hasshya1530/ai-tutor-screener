# backend/evaluator.py

import os
import requests
import json
import re
from dotenv import load_dotenv
from pathlib import Path

# ── ENVIRONMENT SETUP ────────────────────────────────────────────────────────
# 1. Try to load .env if it exists (for local development)
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# 2. Get API Key (Render will provide this via system environment)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_answer(question: str, answer: str) -> dict:
    """
    Sends question + answer to Groq API (Llama3).
    Returns structured evaluation dict.
    """

    if not GROQ_API_KEY:
        return _fallback_evaluation(
            "GROQ_API_KEY not found. Please add it to Render Environment Variables."
        )

    # If the transcript is empty or too short, don't waste an API call
    if not answer or len(answer.strip()) < 5:
        return _fallback_evaluation(
            "The transcript is too short or empty to evaluate. Please try recording again."
        )

    system_message = (
        "You are an expert education evaluator. "
        "Respond ONLY with a valid JSON object. No markdown, no prose."
    )

    user_message = f"""Evaluate this tutor candidate response.

QUESTION: {question}
ANSWER: {answer}

Return ONLY this JSON structure:
{{
  "score": <1-10>,
  "subject_knowledge": "<Poor/Fair/Good/Excellent>",
  "communication_clarity": "<Poor/Fair/Good/Excellent>",
  "teaching_approach": "<Poor/Fair/Good/Excellent>",
  "strengths": "<one sentence>",
  "improvements": "<one sentence>",
  "verdict": "<Rejected/Maybe/Shortlisted>"
}}"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "max_tokens": 500,
        "temperature": 0.1
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=20)

        if response.status_code != 200:
            return _fallback_evaluation(f"Groq API Error {response.status_code}: {response.text[:100]}")

        result = response.json()
        raw_text = result["choices"][0]["message"]["content"]
        return _parse_evaluation_json(raw_text)

    except Exception as e:
        return _fallback_evaluation(f"Evaluation request failed: {str(e)}")

def _parse_evaluation_json(raw_text: str) -> dict:
    """Safely extracts JSON from LLM output."""
    raw_text = raw_text.strip()
    
    try:
        # Try finding the first '{' and last '}' to handle LLM conversational filler
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        if start != -1 and end != 0:
            json_str = raw_text[start:end]
            return _validate_and_clean(json.loads(json_str))
        return _validate_and_clean(json.loads(raw_text))
    except Exception:
        return _fallback_evaluation("Failed to parse evaluation result.")

def _validate_and_clean(parsed: dict) -> dict:
    """Ensures all required keys exist and types are correct."""
    required_keys = ["score", "subject_knowledge", "communication_clarity", "teaching_approach", "strengths", "improvements", "verdict"]
    for key in required_keys:
        if key not in parsed:
            parsed[key] = "N/A"
    return parsed

def _fallback_evaluation(error_message: str) -> dict:
    """Fallback when things go wrong."""
    return {
        "score": 0,
        "subject_knowledge": "N/A",
        "communication_clarity": "N/A",
        "teaching_approach": "N/A",
        "strengths": "Error during evaluation",
        "improvements": error_message,
        "verdict": "Error"
    }