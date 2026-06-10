from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import json

load_dotenv()

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'projectId': os.getenv("FIREBASE_PROJECT_ID"),
})

db = firestore.client()
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Eval API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth dependency ──────────────────────────────────────────
async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    token = authorization.split(" ")[1]
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Models ───────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str        # "easy" | "medium" | "hard"
    count: int
    question_type: str     # "mcq" | "true_false"

class SaveQuestionsRequest(BaseModel):
    questions: list

# ── Routes ───────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Eval API is running"}

@app.get("/api/me")
async def get_me(user=Depends(get_current_user)):
    return {"uid": user["uid"], "email": user.get("email")}

@app.post("/api/questions/generate")
async def generate_questions(req: GenerateRequest, user=Depends(get_current_user)):
    prompt = f"""
You are an expert teacher. Generate {req.count} {req.difficulty} difficulty {req.question_type} questions
about "{req.topic}" for the subject "{req.subject}".

Return ONLY a valid JSON array, no explanation, no markdown, no backticks.
Each object must have exactly these fields:
- "question": the question text
- "options": array of 4 strings (for mcq) or ["True", "False"] (for true_false)
- "answer": the correct option string
- "explanation": a brief explanation of the answer

Example format:
[
  {{
    "question": "What is ...",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "Because ..."
  }}
]
"""
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        text = response.text.strip()
        # Strip markdown code fences if Gemini adds them
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        questions = json.loads(text.strip())
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/questions/save")
async def save_questions(req: SaveQuestionsRequest, user=Depends(get_current_user)):
    uid = user["uid"]
    saved = []
    for q in req.questions:
        doc_ref = db.collection("question_bank").document()
        q["uid"] = uid
        doc_ref.set(q)
        saved.append(doc_ref.id)
    return {"saved": len(saved), "ids": saved}

@app.get("/api/questions")
async def get_questions(user=Depends(get_current_user)):
    uid = user["uid"]
    docs = db.collection("question_bank").where("uid", "==", uid).stream()
    questions = []
    for doc in docs:
        q = doc.to_dict()
        q["id"] = doc.id
        questions.append(q)
    return {"questions": questions}