import sys
import os
sys.path.append(os.getcwd())

from backend.ai_utils import transcribe_audio
import time

# Dummy data
dummy_audio = b"dummy audio data"

print("--- STARTING TRANSCRIPTION TEST ---")
start = time.time()
try:
    result = transcribe_audio(dummy_audio, lang="en-IN")
    print(f"Result: {result}")
except Exception as e:
    print(f"Caught Exception: {e}")
print(f"Time taken: {time.time() - start:.2f}s")
