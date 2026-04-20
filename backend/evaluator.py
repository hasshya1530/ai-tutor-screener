# backend/evaluator.py

import os
import requests
import json
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Groq is free, fast, and runs Llama3 — open source model
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant" # Free tier, open source Meta Llama 3


def evaluate_answer(question: str, answer: str) -> dict:
    """
    Sends question + answer to Groq API (Llama3).
    Returns structured evaluation dict.
    """

    if not GROQ_API_KEY:
        return _fallback_evaluation(
            "GROQ_API_KEY not set. Add it to your .env file."
        )

    system_message = (
        "You are an expert education evaluator assessing tutor candidates. "
        "You ALWAYS respond with ONLY a valid JSON object. "
        "No explanation. No markdown. No extra text before or after the JSON."
    )

    user_message = f"""Evaluate this tutor candidate response.

QUESTION: {question}

ANSWER: {answer}

Return ONLY this JSON object, nothing else:
{{
  "score": <integer 1-10>,
  "subject_knowledge": "<Poor/Fair/Good/Excellent>",
  "communication_clarity": "<Poor/Fair/Good/Excellent>",
  "teaching_approach": "<Poor/Fair/Good/Excellent>",
  "strengths": "<one sentence about what they did well>",
  "improvements": "<one sentence about what they should improve>",
  "verdict": "<Rejected/Maybe/Shortlisted>"
}}

Scoring guide:
- 1-3: Rejected (vague, wrong, or irrelevant answer)
- 4-6: Maybe (partially correct, needs improvement)
- 7-10: Shortlisted (clear, accurate, pedagogically sound)"""

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
        "max_tokens": 400,
        "temperature": 0.1,
        "stream": False
    }

    try:
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=30  # Groq is very fast — 30s is more than enough
        )

        if response.status_code == 401:
            return _fallback_evaluation(
                "Invalid Groq API key. Check GROQ_API_KEY in your .env file."
            )

        if response.status_code == 429:
            return _fallback_evaluation(
                "Groq rate limit hit. Wait 10 seconds and retry."
            )

        if response.status_code != 200:
            return _fallback_evaluation(
                f"Groq API error {response.status_code}: {response.text[:300]}"
            )

        result = response.json()
        raw_text = result["choices"][0]["message"]["content"]
        return _parse_evaluation_json(raw_text)

    except requests.exceptions.Timeout:
        return _fallback_evaluation("Groq request timed out. Retry.")
    except requests.exceptions.ConnectionError:
        return _fallback_evaluation("Cannot reach Groq API. Check internet.")
    except KeyError:
        return _fallback_evaluation(
            f"Unexpected Groq response format: {str(result)[:200]}"
        )
    except Exception as e:
        return _fallback_evaluation(f"Unexpected error: {str(e)}")


def _parse_evaluation_json(raw_text: str) -> dict:
    """Safely extracts JSON from LLM output."""
    raw_text = raw_text.strip()

    # Strategy 1: direct parse
    try:
        return _validate_and_clean(json.loads(raw_text))
    except json.JSONDecodeError:
        pass

    # Strategy 2: find { ... } block
    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1

    if start == -1 or end == 0:
        return _fallback_evaluation(
            f"No JSON found in response: {raw_text[:200]}"
        )

    json_str = raw_text[start:end]

    try:
        return _validate_and_clean(json.loads(json_str))
    except json.JSONDecodeError:
        # Strategy 3: fix common LLM JSON issues
        try:
            import re
            cleaned = re.sub(r',\s*([}\]])', r'\1', json_str)
            return _validate_and_clean(json.loads(cleaned))
        except Exception:
            return _fallback_evaluation(
                f"Could not parse JSON: {json_str[:300]}"
            )


def _validate_and_clean(parsed: dict) -> dict:
    """Ensures all required keys exist with correct types."""
    valid_ratings = {"Poor", "Fair", "Good", "Excellent"}
    valid_verdicts = {"Rejected", "Maybe", "Shortlisted"}

    required_keys = [
        "score", "subject_knowledge", "communication_clarity",
        "teaching_approach", "strengths", "improvements", "verdict"
    ]

    for key in required_keys:
        if key not in parsed:
            parsed[key] = "N/A"

    # Sanitize score
    try:
        parsed["score"] = max(1, min(10, int(float(str(parsed["score"])))))
    except (ValueError, TypeError):
        parsed["score"] = 5

    # Sanitize rating fields
    for field in ["subject_knowledge", "communication_clarity", "teaching_approach"]:
        val = str(parsed[field]).strip().capitalize()
        parsed[field] = val if val in valid_ratings else "Fair"

    # Sanitize verdict
    val = str(parsed["verdict"]).strip().capitalize()
    parsed["verdict"] = val if val in valid_verdicts else "Maybe"

    return parsed


def _fallback_evaluation(error_message: str) -> dict:
    """Safe fallback when evaluation fails."""
    return {
        "score": 0,
        "subject_knowledge": "N/A",
        "communication_clarity": "N/A",
        "teaching_approach": "N/A",
        "strengths": "Evaluation unavailable",
        "improvements": "Evaluation unavailable",
        "verdict": "Error",
        "error": error_message
    }