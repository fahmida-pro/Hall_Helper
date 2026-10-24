import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
load_dotenv(ROOT_DIR / ".env")

app = Flask(__name__, static_folder=None)

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "").strip()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4").strip()
OLLAMA_CHAT_URL = "https://ollama.com/api/chat"

SYSTEM_PROMPT = """
You are HallHelper, a kind, practical assistant for students living in a university
female hall/hostel in Bangladesh. Be friendly, concise, and respectful.
Help with everyday hall questions, organizing tasks, lost-and-found posts, and
drafting polite messages to hall staff. Do not invent official hall rules,
phone numbers, or emergency contacts. If asked for urgent medical/safety help,
tell the student to contact hall staff/security or local emergency services.
If you do not know an official detail, say so and suggest checking with hall staff.
"""


@app.get("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "api_key_configured": bool(OLLAMA_API_KEY),
                    "model": OLLAMA_MODEL})


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Please type a message first."}), 400
    if not OLLAMA_API_KEY:
        return jsonify({
            "error": "Ollama API key is missing. Add OLLAMA_API_KEY to the .env file, then restart HallHelper."
        }), 503

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Keep only a small amount of conversation history.
    if isinstance(history, list):
        for item in history[-8:]:
            if isinstance(item, dict) and item.get("role") in ("user", "assistant"):
                content = str(item.get("content", ""))[:3000]
                if content:
                    messages.append({"role": item["role"], "content": content})
    messages.append({"role": "user", "content": message})

    try:
        response = requests.post(
            OLLAMA_CHAT_URL,
            headers={
                "Authorization": f"Bearer {OLLAMA_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": OLLAMA_MODEL, "messages": messages, "stream": False},
            timeout=90,
        )
        if response.status_code >= 400:
            detail = "Ollama Cloud request failed."
            try:
                detail = response.json().get("error", detail)
            except ValueError:
                pass
            return jsonify({"error": f"{detail} (HTTP {response.status_code})"}), 502

        result = response.json()
        answer = result.get("message", {}).get("content", "").strip()
        if not answer:
            answer = "I couldn't generate a reply just now. Please try again."
        return jsonify({"reply": answer})
    except requests.Timeout:
        return jsonify({"error": "Gemma took too long to reply. Please try again."}), 504
    except requests.RequestException:
        return jsonify({"error": "Could not connect to Ollama Cloud. Check your internet connection."}), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
