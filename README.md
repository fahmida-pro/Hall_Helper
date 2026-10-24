# HallHelper ♡

A cute, pink-themed starter web app for university female-hall students. It has a responsive frontend and a Flask backend connected to Gemma through Ollama Cloud.

## Requirements
- Python 3.12+
- An Ollama Cloud API key
- Internet connection

## Run in VS Code (Windows PowerShell)

Open the `HallHelper` folder in VS Code, then open **Terminal → New Terminal**.

1. Create and activate a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Create your private environment file:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Open `.env` in VS Code. Replace the example value with your own Ollama API key. Keep the key private. Do not put it in frontend files or commit `.env` to GitHub.
5. Start the app:
   ```powershell
   python backend/app.py
   ```
6. Open http://127.0.0.1:5000 in your browser.

## Model
The default model is `gemma4`, accessed through `https://ollama.com/api/chat`. If your Ollama account/model access uses a different supported model identifier, change `OLLAMA_MODEL` in `.env`.

## Notes
- The quick-action cards help fill in a suggested prompt; click Send to submit it.
- This is a starter demo, not an official hall reporting system. Reports are not sent to hall authorities or saved to a database.
- Do not share passwords, private documents, or sensitive personal information with the chatbot.
