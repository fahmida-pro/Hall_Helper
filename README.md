# HallHelper

**Empowering female university students to navigate hall life with confidence.**

HallHelper is an AI-powered student support platform designed to help female university students manage everyday challenges of university hall life. From planning study schedules and drafting formal messages to navigating common living challenges, HallHelper provides accessible, practical, and supportive assistance in one place.

## Overview

Living in a university hall brings new responsibilities, academic pressure, and everyday challenges. HallHelper aims to make these experiences easier by providing students with a convenient digital assistant for organizing tasks, finding practical solutions, and communicating more effectively.

Built with a lightweight web interface and an AI-powered backend, HallHelper combines accessibility, simplicity, and responsible AI assistance to support students in their daily lives.

## Key Features

* **AI-Powered Assistance:** Get practical suggestions for common hall-life challenges.
* **Formal Message Drafting:** Prepare respectful complaints, requests, and messages for hall staff.
* **Study Planning:** Organize study sessions and manage academic responsibilities.
* **Everyday Problem-Solving:** Break down challenging situations into manageable next steps.
* **Response Management:** Copy, share, or regenerate AI-generated responses.
* **Responsive Interface:** Access the platform across desktop and mobile devices.
* **Student-Centered Design:** Built around the everyday needs and experiences of female university hall students.

## Technology Stack

| Technology   | Purpose                                     |
| ------------ | ------------------------------------------- |
| HTML5        | Frontend structure                          |
| CSS3         | Responsive user interface                   |
| JavaScript   | Frontend interactions and API communication |
| Python       | Backend implementation                      |
| Flask        | Backend API and application routing         |
| Gemma        | Open-weight language model                  |
| Ollama Cloud | Model inference service                     |
| Vercel       | Web application deployment                  |

## AI Model Disclosure

HallHelper integrates an open-weight language model to generate conversational responses and practical suggestions.

* **Model:** `gemma4` by default, configurable through `OLLAMA_MODEL`
* **Inference provider:** Ollama Cloud
* **API endpoint:** `https://ollama.com/api/chat`
* **Primary use cases:** Everyday problem-solving, study planning, and drafting messages to hall staff
* **Backend:** Flask processes requests and communicates with the inference provider.
* **Credential security:** The API key is configured through an environment variable and should never be exposed in frontend code or committed to version control.

The assistant is instructed to provide respectful, concise, and practical responses. It should not invent official university policies, contact information, or emergency procedures.

## Live Demo

**Application:** https://hall-helper-five.vercel.app/

The live deployment allows users to explore the interface and, when the AI service is configured correctly, interact with the assistant.

## Getting Started

### Prerequisites

* Python 3.12 or later
* Git
* An Ollama Cloud API key with access to the configured model
* An internet connection

### 1. Clone the Repository

```bash
git clone https://github.com/fahmida-pro/Hall_Helper.git
cd Hall_Helper
```

### 2. Create a Virtual Environment

```powershell
python -m venv .venv
```

### 3. Activate the Environment

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and add your own credentials:

```dotenv
OLLAMA_API_KEY=your_ollama_api_key_here
OLLAMA_MODEL=gemma4
```

Replace the placeholder with your own valid API key. Never publish your actual key.

### 6. Run the Application

```bash
python backend/app.py
```

Open the application in your browser:

`http://127.0.0.1:5000`

## Project Structure

```text
Hall_Helper/
├── backend/
│   └── app.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example
├── .gitignore
├── requirements.txt
├── vercel.json
├── README.md
└── LICENSE
```

## Privacy, Safety, and Limitations

* HallHelper is an independent student-support project, not an official university or hall administration service.
* Messages submitted to the assistant are sent to the configured AI inference provider for processing.
* The current version does not include a database-backed reporting system or direct communication with hall authorities.
* AI-generated responses may be inaccurate and should be reviewed before use.
* Users should not submit passwords, API keys, private documents, or other sensitive information.
* For urgent medical or safety concerns, users should contact appropriate hall staff, security personnel, or local emergency services.

## Future Development

Potential improvements include:

* Verified hall announcements and notices
* Lost-and-found assistance
* Shared-room chore coordination
* Assignment and examination reminders
* Bengali and English language support
* Secure reporting workflows and status tracking

## License

This project is intended to use the **MIT License**. Refer to the `LICENSE` file for the complete license terms.

---

**HallHelper — Practical support for a better university hall experience.**
