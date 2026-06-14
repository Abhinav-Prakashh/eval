from fastapi import FastAPI, Depends, HTTPException, Header, Response, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google import genai
from dotenv import load_dotenv
import cv2
import numpy as np
import base64
import os
import json
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Flowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

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
    difficulty: str
    count: int
    question_type: str

class SaveQuestionsRequest(BaseModel):
    questions: list

class PaperConfig(BaseModel):
    title: str
    subject: str
    class_name: str
    date: str
    duration: str
    total_marks: int
    instructions: list[str]
    questions: list

class OMRConfig(BaseModel):
    title: str
    subject: str
    class_name: str
    date: str
    num_questions: int
    num_options: int = 4

# ── OMR Grid Flowable ────────────────────────────────────────
class OMRGrid(Flowable):
    def __init__(self, num_questions, num_options, questions_per_col):
        super().__init__()
        self.num_questions = num_questions
        self.num_options = num_options
        self.questions_per_col = questions_per_col
        self.option_labels = ['A', 'B', 'C', 'D', 'E'][:num_options]
        self.cell_w = 0.65 * cm
        self.cell_h = 0.60 * cm
        self.q_col_w = 0.80 * cm
        self.gap = 1.0 * cm
        self.bubble_r = 0.18 * cm
        self.side_w = self.q_col_w + num_options * self.cell_w
        self.total_w = self.side_w * 2 + self.gap
        rows = questions_per_col + 1
        self.total_h = rows * self.cell_h
        self._width = self.total_w
        self._height = self.total_h

    def wrap(self, availW, availH):
        return self.total_w, self.total_h

    def draw(self):
        c = self.canv
        qpc = self.questions_per_col

        for side in range(2):
            x_origin = side * (self.side_w + self.gap)

            y = self.total_h - self.cell_h
            c.setFont("Helvetica-Bold", 8)
            c.setFillColor(colors.HexColor('#00288e'))
            c.drawCentredString(x_origin + self.q_col_w / 2, y + self.cell_h * 0.3, "Q")
            for j, lbl in enumerate(self.option_labels):
                cx = x_origin + self.q_col_w + j * self.cell_w + self.cell_w / 2
                c.drawCentredString(cx, y + self.cell_h * 0.3, lbl)

            c.setStrokeColor(colors.HexColor('#c4c5d5'))
            c.setLineWidth(0.4)
            c.line(x_origin, y, x_origin + self.side_w, y)

            start_q = side * qpc + 1
            end_q = min(start_q + qpc - 1, self.num_questions)

            for idx, q_num in enumerate(range(start_q, end_q + 1)):
                row_y = self.total_h - self.cell_h * (idx + 2)

                if idx % 2 == 1:
                    c.setFillColor(colors.HexColor('#f0f4ff'))
                    c.rect(x_origin, row_y, self.side_w, self.cell_h, fill=1, stroke=0)

                c.setFillColor(colors.HexColor('#0d1c2e'))
                c.setFont("Helvetica-Bold", 8)
                c.drawCentredString(
                    x_origin + self.q_col_w / 2,
                    row_y + self.cell_h * 0.3,
                    str(q_num)
                )

                c.setStrokeColor(colors.HexColor('#444653'))
                c.setLineWidth(0.8)
                for j in range(self.num_options):
                    cx = x_origin + self.q_col_w + j * self.cell_w + self.cell_w / 2
                    cy = row_y + self.cell_h / 2
                    c.circle(cx, cy, self.bubble_r, fill=0, stroke=1)

                c.setStrokeColor(colors.HexColor('#e2e8f0'))
                c.setLineWidth(0.3)
                c.line(x_origin, row_y, x_origin + self.side_w, row_y)

            c.setStrokeColor(colors.HexColor('#c4c5d5'))
            c.setLineWidth(0.5)
            c.rect(x_origin, 0, self.side_w, self.total_h, fill=0, stroke=1)


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
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        start = text.find("[")
        end = text.rfind("]") + 1
        text = text[start:end]
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

@app.get("/api/results")
async def get_results(user=Depends(get_current_user)):
    uid = user["uid"]
    docs = db.collection("omr_results").where("uid", "==", uid).stream()
    results = []
    for doc in docs:
        r = doc.to_dict()
        r["id"] = doc.id
        r.pop("annotated_image", None)
        results.append(r)
    return {"results": results}

# ── Question Paper PDF ───────────────────────────────────────
@app.post("/api/paper/generate-pdf")
async def generate_paper_pdf(config: PaperConfig, user=Depends(get_current_user)):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('CustomTitle', parent=styles['Normal'],
        fontSize=16, fontName='Helvetica-Bold', alignment=TA_CENTER,
        spaceAfter=4, textColor=colors.HexColor('#00288e'))
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
        fontSize=11, fontName='Helvetica', alignment=TA_CENTER,
        spaceAfter=2, textColor=colors.HexColor('#444653'))
    section_style = ParagraphStyle('Section', parent=styles['Normal'],
        fontSize=10, fontName='Helvetica-Bold', spaceAfter=6,
        spaceBefore=10, textColor=colors.HexColor('#00288e'))
    question_style = ParagraphStyle('Question', parent=styles['Normal'],
        fontSize=10, fontName='Helvetica', spaceAfter=4,
        leading=14, textColor=colors.HexColor('#0d1c2e'))
    option_style = ParagraphStyle('Option', parent=styles['Normal'],
        fontSize=10, fontName='Helvetica', leftIndent=20,
        spaceAfter=2, leading=13, textColor=colors.HexColor('#444653'))
    instruction_style = ParagraphStyle('Instruction', parent=styles['Normal'],
        fontSize=9, fontName='Helvetica', spaceAfter=3,
        leading=13, textColor=colors.HexColor('#444653'))

    story = []
    story.append(Paragraph(config.title, title_style))
    story.append(Paragraph(f"{config.subject} — {config.class_name}", subtitle_style))
    story.append(Spacer(1, 0.3*cm))

    meta_data = [[
        Paragraph(f"<b>Date:</b> {config.date}", styles['Normal']),
        Paragraph(f"<b>Duration:</b> {config.duration}", styles['Normal']),
        Paragraph(f"<b>Total Marks:</b> {config.total_marks}", styles['Normal']),
    ]]
    meta_table = Table(meta_data, colWidths=[5.5*cm, 5.5*cm, 5.5*cm])
    meta_table.setStyle(TableStyle([
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0d1c2e')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.2*cm))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#00288e')))
    story.append(Spacer(1, 0.3*cm))

    if config.instructions:
        story.append(Paragraph("General Instructions:", section_style))
        for i, inst in enumerate(config.instructions, 1):
            story.append(Paragraph(f"{i}. {inst}", instruction_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c4c5d5')))
        story.append(Spacer(1, 0.4*cm))

    story.append(Paragraph(f"Questions ({len(config.questions)} Total)", section_style))
    story.append(Spacer(1, 0.2*cm))

    marks_per_q = config.total_marks // len(config.questions) if config.questions else 1
    for i, q in enumerate(config.questions, 1):
        story.append(Paragraph(
            f"<b>Q{i}.</b> {q['question']} <font size='9' color='#757684'>[{marks_per_q} mark{'s' if marks_per_q > 1 else ''}]</font>",
            question_style
        ))
        if q.get('options'):
            opt_labels = ['(a)', '(b)', '(c)', '(d)']
            for j, opt in enumerate(q['options']):
                label = opt_labels[j] if j < len(opt_labels) else f"({j+1})"
                story.append(Paragraph(f"{label} {opt}", option_style))
        story.append(Spacer(1, 0.4*cm))

    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c4c5d5')))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph("— End of Question Paper —", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.read()
    filename = f"{config.title.replace(' ', '_')}_question_paper.pdf"
    return Response(content=pdf_bytes, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"})

# ── OMR Sheet PDF ────────────────────────────────────────────
@app.post("/api/omr/generate-sheet")
async def generate_omr_sheet(config: OMRConfig, user=Depends(get_current_user)):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=1.5*cm, bottomMargin=1.5*cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('OMRTitle', parent=styles['Normal'],
        fontSize=14, fontName='Helvetica-Bold', alignment=TA_CENTER,
        spaceAfter=2, textColor=colors.HexColor('#00288e'))
    subtitle_style = ParagraphStyle('OMRSubtitle', parent=styles['Normal'],
        fontSize=9, fontName='Helvetica', alignment=TA_CENTER,
        spaceAfter=4, textColor=colors.HexColor('#444653'))
    label_style = ParagraphStyle('Label', parent=styles['Normal'],
        fontSize=8, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0d1c2e'))
    instr_style = ParagraphStyle('Instr', parent=styles['Normal'],
        fontSize=8, fontName='Helvetica',
        textColor=colors.HexColor('#444653'), spaceAfter=10)

    story = []
    story.append(Paragraph(config.title, title_style))
    story.append(Paragraph(f"{config.subject} — {config.class_name} — {config.date}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#00288e')))
    story.append(Spacer(1, 0.3*cm))

    student_info = [[
        Paragraph("Student Name:", label_style),
        Paragraph("_" * 35, label_style),
        Paragraph("Roll No:", label_style),
        Paragraph("_" * 12, label_style),
    ]]
    info_table = Table(student_info, colWidths=[3*cm, 7*cm, 2*cm, 3.5*cm])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(info_table)
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c4c5d5')))
    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(
        "Instructions: Use a dark pen or pencil. Fill the bubble completely. Do not make any stray marks.",
        instr_style
    ))

    questions_per_col = (config.num_questions + 1) // 2
    story.append(OMRGrid(config.num_questions, config.num_options, questions_per_col))
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#c4c5d5')))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph("— End of OMR Sheet —", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.read()
    filename = f"{config.title.replace(' ', '_')}_OMR_sheet.pdf"
    return Response(content=pdf_bytes, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"})

# ── OMR Evaluate ─────────────────────────────────────────────
@app.post("/api/omr/evaluate")
async def evaluate_omr(
    file: UploadFile = File(...),
    answers: str = Form(...),
    num_options: int = Form(4),
    student_name: str = Form(""),
    roll_number: str = Form(""),
    user=Depends(get_current_user)
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image")

        answer_key = json.loads(answers)
        num_questions = len(answer_key)
        option_labels = ['A', 'B', 'C', 'D', 'E'][:num_options]

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(
            blurred, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2
        )

        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        bubbles = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < 100 or area > 5000:
                continue
            perimeter = cv2.arcLength(cnt, True)
            if perimeter == 0:
                continue
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            if circularity > 0.55:
                (x, y), radius = cv2.minEnclosingCircle(cnt)
                bubbles.append({
                    "x": float(x),
                    "y": float(y),
                    "r": float(radius),
                    "area": float(area),
                    "contour": cnt
                })

        if len(bubbles) < num_questions * num_options:
            raise HTTPException(
                status_code=422,
                detail=f"Only found {len(bubbles)} bubbles, expected at least {num_questions * num_options}. Try a clearer photo with better lighting."
            )

        bubbles.sort(key=lambda b: (round(b["y"] / 15), b["x"]))

        rows = []
        current_row = [bubbles[0]]
        for b in bubbles[1:]:
            if abs(b["y"] - current_row[0]["y"]) < 15:
                current_row.append(b)
            else:
                rows.append(sorted(current_row, key=lambda x: x["x"]))
                current_row = [b]
        rows.append(sorted(current_row, key=lambda x: x["x"]))

        valid_rows = [r for r in rows if len(r) == num_options]

        if len(valid_rows) < num_questions:
            raise HTTPException(
                status_code=422,
                detail=f"Could only detect {len(valid_rows)} valid question rows, need {num_questions}. Try a clearer photo."
            )

        valid_rows = valid_rows[:num_questions]

        results = []
        score = 0

        for i, row in enumerate(valid_rows):
            filled_idx = -1
            max_fill = 0

            for j, bubble in enumerate(row):
                mask = np.zeros(gray.shape, dtype=np.uint8)
                cv2.circle(
                    mask,
                    (int(bubble["x"]), int(bubble["y"])),
                    int(bubble["r"] * 0.8),
                    255, -1
                )
                masked = cv2.bitwise_and(thresh, thresh, mask=mask)
                fill_count = cv2.countNonZero(masked)
                fill_ratio = fill_count / (np.pi * (bubble["r"] * 0.8) ** 2)

                if fill_ratio > max_fill:
                    max_fill = fill_ratio
                    filled_idx = j

            if max_fill < 0.25:
                selected = None
            else:
                selected = option_labels[filled_idx] if filled_idx >= 0 else None

            correct = answer_key[i] if i < len(answer_key) else None
            is_correct = selected == correct

            if is_correct and selected is not None:
                score += 1

            results.append({
                "question": i + 1,
                "selected": selected,
                "correct": correct,
                "is_correct": is_correct,
            })

        annotated = img.copy()
        for i, row in enumerate(valid_rows):
            correct_ans = answer_key[i] if i < len(answer_key) else None
            for j, bubble in enumerate(row):
                selected_label = results[i]["selected"]
                current_label = option_labels[j]
                cx, cy, r = int(bubble["x"]), int(bubble["y"]), int(bubble["r"])

                if current_label == selected_label and current_label == correct_ans:
                    color = (0, 200, 0)
                elif current_label == selected_label:
                    color = (0, 0, 220)
                elif current_label == correct_ans:
                    color = (0, 165, 255)
                else:
                    color = (180, 180, 180)

                cv2.circle(annotated, (cx, cy), r, color, 2)

        _, img_encoded = cv2.imencode('.jpg', annotated)
        annotated_b64 = base64.b64encode(img_encoded.tobytes()).decode('utf-8')

        result_doc = {
            "uid": user["uid"],
            "student_name": student_name,
            "roll_number": roll_number,
            "score": score,
            "total": num_questions,
            "percentage": round(score / num_questions * 100, 1),
            "results": results,
            "answer_key": answer_key,
            "timestamp": firestore.SERVER_TIMESTAMP,
        }
        db.collection("omr_results").add(result_doc)

        return {
            "score": score,
            "total": num_questions,
            "percentage": round(score / num_questions * 100, 1),
            "results": results,
            "annotated_image": annotated_b64
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

# ── AI Analytics ─────────────────────────────────────────────
@app.post("/api/analytics/analyze")
async def analyze_results(user=Depends(get_current_user)):
    uid = user["uid"]
    docs = db.collection("omr_results").where("uid", "==", uid).stream()
    all_results = []
    for doc in docs:
        r = doc.to_dict()
        r.pop("annotated_image", None)
        all_results.append(r)

    if not all_results:
        raise HTTPException(status_code=400, detail="No results to analyze")

    question_counts = {}
    question_correct = {}
    for r in all_results:
        for q in r.get("results", []):
            qn = q["question"]
            question_counts[qn] = question_counts.get(qn, 0) + 1
            if q["is_correct"]:
                question_correct[qn] = question_correct.get(qn, 0) + 1

    question_analysis = []
    for qn in sorted(question_counts.keys()):
        rate = round(question_correct.get(qn, 0) / question_counts[qn] * 100)
        question_analysis.append({"question": qn, "correct_rate": rate})

    avg = round(sum(r["percentage"] for r in all_results) / len(all_results), 1)
    scores_summary = f"Average score: {avg}%. Scores range from {min(r['percentage'] for r in all_results)}% to {max(r['percentage'] for r in all_results)}%."
    weak_questions = [q for q in question_analysis if q["correct_rate"] < 50]
    strong_questions = [q for q in question_analysis if q["correct_rate"] >= 70]

    prompt = f"""
You are an educational analyst. Analyze these exam results and provide insights.

Total evaluations: {len(all_results)}
{scores_summary}
Questions with low success rate (<50%): {[q['question'] for q in weak_questions]}
Questions with high success rate (>=70%): {[q['question'] for q in strong_questions]}

Per-question correct rates: {question_analysis}

Return ONLY a valid JSON object. No markdown, no backticks, no explanation before or after.
{{
  "summary": "2-3 sentence overall class performance summary",
  "learning_gaps": ["specific gap 1", "specific gap 2", "specific gap 3"],
  "strong_areas": ["strong area 1", "strong area 2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}}
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        text = response.text.strip()
        # Remove markdown fences if present
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        # Extract JSON object by finding braces
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON object found in response")
        text = text[start:end]
        analysis = json.loads(text)
        analysis["question_analysis"] = question_analysis
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
class CreateUserRequest(BaseModel):
    email: str
    password: str
    name: str

@app.post("/api/admin/create-user")
async def create_user(req: CreateUserRequest, user=Depends(get_current_user)):
    # Check if requester is admin
    uid = user["uid"]
    doc = db.collection("admins").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        new_user = auth.create_user(
            email=req.email,
            password=req.password,
            display_name=req.name
        )
        return {"uid": new_user.uid, "email": new_user.email, "name": req.name}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/users")
async def list_users(user=Depends(get_current_user)):
    uid = user["uid"]
    doc = db.collection("admins").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = []
    for u in auth.list_users().iterate_all():
        users.append({
            "uid": u.uid,
            "email": u.email,
            "name": u.display_name or "",
            "disabled": u.disabled,
        })
    return {"users": users}

@app.delete("/api/admin/users/{uid}")
async def delete_user(uid: str, user=Depends(get_current_user)):
    admin_uid = user["uid"]
    doc = db.collection("admins").document(admin_uid).get()
    if not doc.exists:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    auth.delete_user(uid)
    return {"deleted": uid}