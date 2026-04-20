# backend/download_models.py
from faster_whisper import WhisperModel
print("Downloading Whisper small model...")
WhisperModel("small", device="cpu", compute_type="int8", download_root="/tmp/whisper_models")
print("Whisper model downloaded successfully!")