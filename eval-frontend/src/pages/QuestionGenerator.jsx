import { useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    difficulty: "medium",
    count: 5,
    question_type: "mcq",
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleGenerate() {
    setError("");
    setSaved(false);
    setQuestions([]);
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.post(`${BACKEND}/api/questions/generate`, form, { headers });
      setQuestions(res.data.questions);
    } catch (err) {
      setError("Failed to generate questions. Check your Gemini API key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const headers = await getAuthHeader();
      await axios.post(
        `${BACKEND}/api/questions/save`,
        { questions: questions.map(q => ({ ...q, subject: form.subject, topic: form.topic, difficulty: form.difficulty })) },
        { headers }
      );
      setSaved(true);
    } catch (err) {
      setError("Failed to save questions.");
    } finally {
      setSaving(false);
    }
  }

  function handleEditQuestion(index, value) {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  }

  function handleEditAnswer(index, value) {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  }

  function handleRemove(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* Top nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="text-on-primary text-xs font-bold">E</span>
          </div>
          <span className="font-semibold text-on-surface">Eval</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-on-surface-variant hover:text-on-surface transition"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            AI Question Generator
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Generate exam questions instantly using Gemini AI
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Biology"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Topic</label>
              <input
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder="e.g. Photosynthesis"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Difficulty</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Question Type</label>
              <select
                name="question_type"
                value={form.question_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="true_false">True / False</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Number of Questions
              </label>
              <input
                name="count"
                type="number"
                min={1}
                max={20}
                value={form.count}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

          </div>

          {error && (
            <div className="mt-4 bg-error-container text-error text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !form.subject || !form.topic}
            className="mt-6 inline-flex items-center gap-2 bg-secondary text-on-secondary font-semibold py-2.5 px-6 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating...
              </>
            ) : (
              <>✦ Generate with AI</>
            )}
          </button>
        </div>

        {/* Generated questions */}
        {questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-on-surface">
                Generated Questions ({questions.length})
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="bg-primary text-on-primary font-semibold py-2 px-5 rounded-lg text-sm hover:bg-primary-container transition disabled:opacity-50"
              >
                {saved ? "✓ Saved to Bank" : saving ? "Saving..." : "Save to Question Bank"}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 border-l-4 border-l-primary"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Q{i + 1}
                    </span>
                    <button
                      onClick={() => handleRemove(i)}
                      className="text-xs text-outline hover:text-error transition"
                    >
                      Remove
                    </button>
                  </div>

                  <textarea
                    value={q.question}
                    onChange={(e) => handleEditQuestion(i, e.target.value)}
                    rows={2}
                    className="w-full text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options?.map((opt, j) => (
                      <div
                        key={j}
                        className={`text-sm px-3 py-2 rounded-lg border ${
                          opt === q.answer
                            ? "border-tertiary-container bg-tertiary-container text-on-tertiary-container font-semibold"
                            : "border-outline-variant text-on-surface-variant"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant">Answer:</span>
                    <select
                      value={q.answer}
                      onChange={(e) => handleEditAnswer(i, e.target.value)}
                      className="text-xs border border-outline-variant rounded px-2 py-1 bg-surface-container-low text-on-surface focus:outline-none"
                    >
                      {q.options?.map((opt, j) => (
                        <option key={j} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {q.explanation && (
                    <p className="text-xs text-on-surface-variant mt-3 bg-surface-container px-3 py-2 rounded-lg">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}