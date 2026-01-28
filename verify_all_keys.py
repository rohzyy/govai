import os
import re

def mask_key(key: str, keep=6) -> str:
    if not key:
        return "<missing>"
    if len(key) <= keep:
        return key
    return f"{key[:keep]}...{key[-4:]}"

def scan_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r') as f:
        content = f.read()

    keys = re.findall(r'AIzaSy[A-Za-z0-9_-]+', content)
    for key in set(keys):
        print(f"Found key-like string in {filepath}: {mask_key(key)}")
        print("  -> Please remove any committed keys and rotate them immediately.")
    # FOR SAFETY: do NOT attempt to call external APIs from this script by default.

if __name__ == "__main__":
    # Scan common files but do not attempt live validation
    scan_file("frontend/.env.local")
    scan_file("backend/config.py")
    for f in os.listdir("."):
        if "env" in f.lower():
            scan_file(f)