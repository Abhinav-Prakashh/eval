import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

const DEFAULT_INSTRUCTIONS = [
  "All questions are compulsory.",
  "Read each question carefully before answering.",
  "Write answers clearly and legibly.",
];

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [filterSubject, setFilterSubject] = useState("All");
  const [config, setConfig] = useState({
    title: "",
    subject: "",
    class_name: "",
    date: new Date().toISOString().split("T")[0],
    duration: "1 hour",
    total_marks: 50,
    instructions: DEFAULT_INSTRUCTIONS,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const headers = await getAuthHeader();
      const res = await axios.get(`${BACKEND}/api/questions`, { headers });
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll(filtered) {
    const filteredIds = filtered.map(q => q.id);
    const allSelected = filteredIds.every(id => selected.includes(id));
    if (allSelected) {
      setSelected(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...filteredIds])]);
    }
  }

  async function handleGeneratePDF() {
    if (selected.length === 0) return;
    setGenerating(true);
    try {
      const headers = await getAuthHeader();
      const selectedQuestions = questions.filter(q => selected.includes(q.id));
      const res = await axios.post(
        `${BACKEND}/api/paper/generate-pdf`,
        { ...config, questions: selectedQuestions },
        { headers, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${config.title || "question_paper"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const subjects = ["All", ...new Set(questions.map(q => q.subject).filter(Boolean))];
  const filtered = filterSubject === "All" ? questions : questions.filter(q => q.subject === filterSubject);

  return (
    <div className="min-h-screen bg-surface">

      {/* Nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="Eval" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-on-surface">Eval</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/generate")}
            className="text-sm text-on-surface-variant hover:text-on-surface transition gap-10"
          >
            + Generate Questions
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-on-surface-variant hover:text-on-surface transition gap-3"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Question Bank</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Select questions to build a question paper
            </p>
          </div>
          {selected.length > 0 && (
            <button
              onClick={() => setShowConfig(true)}
              className="bg-primary text-on-primary font-semibold py-2.5 px-5 rounded-lg text-sm hover:bg-primary-container transition"
            >
              Build Paper ({selected.length} selected)
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filterSubject === s
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {s}
            </button>
          ))}
          {filtered.length > 0 && (
            <button
              onClick={() => toggleSelectAll(filtered)}
              className="ml-auto text-xs text-primary font-semibold hover:underline"
            >
              {filtered.every(q => selected.includes(q.id)) ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="text-center py-20 text-on-surface-variant text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-on-surface-variant text-sm">No questions yet.</p>
            <button
              onClick={() => navigate("/generate")}
              className="mt-4 text-sm text-primary font-semibold hover:underline"
            >
              Generate some questions →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => (
              <div
                key={q.id}
                onClick={() => toggleSelect(q.id)}
                className={`bg-surface-container-lowest border rounded-xl p-4 cursor-pointer transition ${
                  selected.includes(q.id)
                    ? "border-primary border-l-4 border-l-primary bg-surface-container-low"
                    : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition ${
                    selected.includes(q.id) ? "bg-primary border-primary" : "border-outline"
                  }`}>
                    {selected.includes(q.id) && (
                      <svg className="w-2.5 h-2.5 text-on-primary" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface font-medium leading-snug">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {q.subject && (
                        <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                          {q.subject}
                        </span>
                      )}
                      {q.topic && (
                        <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                          {q.topic}
                        </span>
                      )}
                      {q.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          q.difficulty === "easy" ? "bg-tertiary-container text-on-tertiary-container" :
                          q.difficulty === "hard" ? "bg-error-container text-error" :
                          "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Config modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-5">Paper Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Exam Title</label>
                <input
                  value={config.title}
                  onChange={e => setConfig({...config, title: e.target.value})}
                  placeholder="e.g. Mid-Term Examination"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject</label>
                  <input
                    value={config.subject}
                    onChange={e => setConfig({...config, subject: e.target.value})}
                    placeholder="e.g. Biology"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Class</label>
                  <input
                    value={config.class_name}
                    onChange={e => setConfig({...config, class_name: e.target.value})}
                    placeholder="e.g. Grade 10"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Date</label>
                  <input
                    type="date"
                    value={config.date}
                    onChange={e => setConfig({...config, date: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Duration</label>
                  <input
                    value={config.duration}
                    onChange={e => setConfig({...config, duration: e.target.value})}
                    placeholder="e.g. 1 hour"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Total Marks</label>
                <input
                  type="number"
                  value={config.total_marks}
                  onChange={e => setConfig({...config, total_marks: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Instructions (one per line)
                </label>
                <textarea
                  rows={4}
                  value={config.instructions.join("\n")}
                  onChange={e => setConfig({...config, instructions: e.target.value.split("\n")})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfig(false); handleGeneratePDF(); }}
                disabled={!config.title || !config.subject || generating}
                className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition disabled:opacity-50"
              >
                {generating ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}