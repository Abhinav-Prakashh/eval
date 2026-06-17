# Eval — AI-Powered Exam Management Platform

Eval is a web-based platform for CBSE educators to create assessments, automatically evaluate OMR answer sheets, and use AI to identify student learning gaps.

---

## Features

- **AI Question Generation** — Generate CBSE-aligned MCQ and True/False questions for Classes 1–12 using Gemini AI
- **Question Bank** — Save, browse, and manage generated questions by subject and chapter
- **Question Paper PDF** — Select questions and generate a formatted, printable question paper
- **OMR Sheet Generation** — Generate printable bubble answer sheets matching your question paper
- **OMR Evaluation Engine** — Upload a photo of a filled OMR sheet and get instant scores using OpenCV
- **Student Results** — Track scores by student name and roll number with pass/fail status
- **Performance Dashboard** — View score trends, class averages, and distribution charts
- **AI Learning Analytics** — Gemini analyzes class results to identify learning gaps and recommend improvements
- **Admin Panel** — Admins can create and manage teacher accounts; public signup is disabled

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Axios, Recharts |
| Backend | FastAPI (Python), Uvicorn |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Computer Vision | OpenCV, NumPy |
| PDF Generation | ReportLab |

---

## Project Structure

```
eval/
├── eval-frontend/          # React frontend
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.png
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuestionGenerator.jsx
│   │   │   ├── QuestionBank.jsx
│   │   │   ├── OMRGenerator.jsx
│   │   │   ├── OMREvaluator.jsx
│   │   │   ├── StudentResults.jsx
│   │   │   ├── AIAnalytics.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
│
└── eval-backend/           # FastAPI backend
    ├── main.py
    ├── requirements.txt
    ├── serviceAccountKey.json   # ← never commit this
    └── .env
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Firebase project (Firestore + Authentication enabled)
- A Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Frontend Setup

```bash
cd eval-frontend
npm install
npm run dev
```

Create `eval-frontend/.env`:

```
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
VITE_BACKEND_URL=http://localhost:8000
```

### Backend Setup

```bash
cd eval-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Create `eval-backend/.env`:

```
FIREBASE_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_gemini_key
```

Place your Firebase service account key at `eval-backend/serviceAccountKey.json`.

---

## Admin Setup

1. Go to Firebase console → Authentication → Add user (this becomes your admin account)
2. Copy the user's UID
3. Go to Firestore → create collection `admins` → add a document with the UID as the document ID → add field `role: "admin"`
4. Log in with the admin account and go to `/admin` to manage teacher accounts

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_BACKEND_URL` | Backend API URL |

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON contents of service account key (for deployment) |

---

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — set root directory to `eval-frontend`, add env variables
- **Backend** → [Render](https://render.com) — set root directory to `eval-backend`, start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## OMR Sheet Tips

- Print the OMR sheet on white paper
- Students must use a **dark pen or pencil** to fill bubbles completely
- Take the photo **straight down** on a flat surface with good lighting
- Avoid shadows and glare for best detection accuracy

---

## License

MIT License — feel free to use and modify for educational purposes.

---

Built for Indian educators/Schools | CBSE Classes 1–12