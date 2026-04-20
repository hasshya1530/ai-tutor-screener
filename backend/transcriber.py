# backend/transcriber.py

import os
import tempfile

_model = None

def get_model():
    global _model

    if _model is None:
        try:
            from faster_whisper import WhisperModel

            print("🔄 Loading Whisper model (tiny)...")

            _model = WhisperModel(
                "tiny",
                device="cpu",
                compute_type="int8",
                download_root="/tmp/whisper_models"  # ✅ cache survives during runtime
            )

            print("✅ Whisper model loaded")

        except Exception as e:
            print(f"❌ Model load failed: {e}")

            # 🔥 FALLBACK (IMPORTANT)
            raise RuntimeError(
                "Speech model failed to load. Try again or use text input."
            )

    return _model


def transcribe_audio(audio_bytes: bytes, file_extension: str = "wav") -> str:

    # Save temp audio file
    with tempfile.NamedTemporaryFile(
        suffix=f".{file_extension}",
        delete=False
    ) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = get_model()

        segments, _ = model.transcribe(
            tmp_path,
            beam_size=1,       # faster
            vad_filter=True    # 🔥 improves speech detection
        )

        transcript = " ".join([seg.text.strip() for seg in segments])

        if not transcript.strip():
            return "No speech detected. Please try again."

        return transcript.strip()

    except Exception as e:
        raise RuntimeError(f"Transcription failed: {str(e)}")

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)