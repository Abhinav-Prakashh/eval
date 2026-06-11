import { useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function OMRGenerator() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    title: "",
    subject: "",
    class_name: "",
    date: new Date().toISOString().split("T")[0],
    num_questions: 20,
    num_options: 4,
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const val = ["num_questions", "num_options"].includes(e.target.name)
      ? parseInt(e.target.value)
      : e.target.value;
    setConfig({ ...config, [e.target.name]: val });
  }

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.post(
        `${BACKEND}/api/omr/generate-sheet`,
        config,
        { headers, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${config.title || "omr_sheet"}_OMR.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to generate OMR sheet. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* Nav */}
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

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            OMR Sheet Generator
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Generate a printable bubble answer sheet for your exam
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <div className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Exam Title</label>
              <input
                name="title"
                value={config.title}
                onChange={handleChange}
                placeholder="e.g. Mid-Term Examination"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject</label>
                <input
                  name="subject"
                  value={config.subject}
                  onChange={handleChange}
                  placeholder="e.g. Biology"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Class</label>
                <input
                  name="class_name"
                  value={config.class_name}
                  onChange={handleChange}
                  placeholder="e.g. Grade 10"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Date</label>
              <input
                name="date"
                type="date"
                value={config.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Number of Questions
                </label>
                <input
                  name="num_questions"
                  type="number"
                  min={5}
                  max={100}
                  value={config.num_questions}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  Options per Question
                </label>
                <select
                  name="num_options"
                  value={config.num_options}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value={2}>2 (True/False)</option>
                  <option value={4}>4 (A B C D)</option>
                  <option value={5}>5 (A B C D E)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-error-container text-error text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !config.title || !config.subject}
              className="w-full bg-primary text-on-primary font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary-container transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? "Generating PDF..." : "Download OMR Sheet"}
            </button>

          </div>
        </div>

        {/* Tip card */}
        <div className="mt-4 bg-surface-container border border-outline-variant rounded-xl p-4">
          <p className="text-xs text-on-surface-variant">
            <span className="font-semibold text-on-surface">💡 Tip:</span> Generate the OMR sheet with the same number of questions as your question paper. Print one sheet per student. After the exam, scan the filled sheets using the OMR Scanner in Phase 5.
          </p>
        </div>

      </div>
    </div>
  );
}