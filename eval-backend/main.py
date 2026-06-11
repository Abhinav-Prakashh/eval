from fastapi import FastAPI, Depends, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google import genai
from dotenv import load_dotenv
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

            # Header row
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

            # Question rows
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