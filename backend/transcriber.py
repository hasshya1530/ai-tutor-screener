import os
import requests
import io
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def transcribe_audio(audio_bytes: bytes, file_extension: str = "wav") -> str:
    """
    Transcribes audio using Groq's cloud-based Whisper API.
    Does not use server RAM, making it perfect for Render.
    """
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not found in environment variables.")

    # Groq Whisper API endpoint
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }

    # We need to give the file a name so Groq knows the format
    # Browsers often send 'webm', but we'll label it based on what's passed
    audio_file = (f"recording.{file_extension}", io.BytesIO(audio_bytes), f"audio/{file_extension}")

    payload = {
        "file": audio_file,
        "model": (None, "whisper-large-v3"),
        "response_format": (None, "json"),
        "language": (None, "en") # Optional: force English
    }

    try:
        # We use a 30s timeout because audio processing can take a moment
        response = requests.post(url, headers=headers, files=payload, timeout=30)
        
        if response.status_code != 200:
            error_data = response.json() if response.status_code == 400 else response.text
            raise RuntimeError(f"Groq Transcription Error {response.status_code}: {error_data}")

        transcript = response.json().get("text", "")
        
        if not transcript.strip():
            return "No speech detected. Please speak louder or check your mic."

        return transcript.strip()

    except Exception as e:
        print(f"❌ Transcription failed: {e}")
        raise RuntimeError(f"Transcription failed: {str(e)}")