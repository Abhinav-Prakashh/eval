import { useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function OMREvaluator() {
  const navigate = useNavigate();
  const [numQuestions, setNumQuestions] = useState(20);
  const [numOptions, setNumOptions] = useState(4);
  const [answerKey, setAnswerKey] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const optionLabels = ['A', 'B', 'C', 'D', 'E'].slice(0, numOptions);

  function initAnswerKey(n) {
    setNumQuestions(n);
    setAnswerKey(Array(n).fill('A'));
  }

  function setAnswer(index, value) {
    const updated = [...answerKey];
    updated[index] = value;
    setAnswerKey(updated);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  }

  async function handleEvaluate() {
    if (!image || answerKey.length === 0) return;
    setError("");
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const formData = new FormData();
      formData.append("file", image);
      formData.append("answers", JSON.stringify(answerKey));
      formData.append("num_options", numOptions);

      const res = await axios.post(
        `${BACKEND}/api/omr/evaluate`,
        formData,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Evaluation failed. Try a clearer photo.");
    } finally {
      setLoading(false);
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
        <button onClick={() => navigate("/dashboard")}
          className="text-sm text-on-surface-variant hover:text-on-surface transition">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">OMR Evaluator</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Upload a filled OMR sheet photo to automatically score it
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — setup */}
          <div className="space-y-5">

            {/* Config */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-semibold text-on-surface mb-4">Sheet Configuration</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Questions</label>
                  <input
                    type="number" min={1} max={100}
                    value={numQuestions}
                    onChange={e => initAnswerKey(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Options</label>
                  <select
                    value={numOptions}
                    onChange={e => setNumOptions(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={2}>2 (T/F)</option>
                    <option value={4}>4 (A-D)</option>
                    <option value={5}>5 (A-E)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => initAnswerKey(numQuestions)}
                className="mt-3 text-xs text-primary font-semibold hover:underline"
              >
                Initialize answer key →
              </button>
            </div>

            {/* Answer key */}
            {answerKey.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                <h2 className="text-sm font-semibold text-on-surface mb-4">
                  Answer Key
                </h2>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {answerKey.map((ans, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-on-surface-variant w-6">
                        Q{i + 1}
                      </span>
                      <div className="flex gap-1">
                        {optionLabels.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setAnswer(i, opt)}
                            className={`w-7 h-7 rounded-full text-xs font-bold transition ${
                              ans === opt
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image upload */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-semibold text-on-surface mb-4">Upload OMR Sheet Photo</h2>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  imagePreview ? "border-primary" : "border-outline-variant hover:border-primary"
                }`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview"
                      className="max-h-48 mx-auto rounded-lg object-contain" />
                  ) : (
                    <>
                      <p className="text-sm text-on-surface-variant">Click to upload photo</p>
                      <p className="text-xs text-outline mt-1">JPG, PNG — good lighting recommended</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <p className="text-xs text-on-surface-variant mt-2 text-center">
                  Click above to change photo
                </p>
              )}
            </div>

            {error && (
              <div className="bg-error-container text-error text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={loading || !image || answerKey.length === 0}
              className="w-full bg-secondary text-on-secondary font-semibold py-2.5 px-4 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Evaluating...
                </span>
              ) : "Evaluate Sheet"}
            </button>
          </div>

          {/* Right — results */}
          <div>
            {result ? (
              <div className="space-y-5">

                {/* Score card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                  <p className="text-sm text-on-surface-variant mb-1">Score</p>
                  <p className="text-5xl font-bold text-primary">
                    {result.score}<span className="text-2xl text-on-surface-variant">/{result.total}</span>
                  </p>
                  <p className="text-2xl font-semibold mt-2" style={{
                    color: result.percentage >= 80 ? '#059669' : result.percentage >= 50 ? '#d97706' : '#dc2626'
                  }}>
                    {result.percentage}%
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {result.percentage >= 80 ? "Excellent!" : result.percentage >= 50 ? "Needs improvement" : "Below average"}
                  </p>
                </div>

                {/* Annotated image */}
                {result.annotated_image && (
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                    <p className="text-xs font-semibold text-on-surface mb-3">Annotated Sheet</p>
                    <img
                      src={`data:image/jpeg;base64,${result.annotated_image}`}
                      alt="annotated"
                      className="w-full rounded-lg"
                    />
                    <div className="flex gap-4 mt-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block"/> Correct
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"/> Wrong
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"/> Correct answer
                      </span>
                    </div>
                  </div>
                )}

                {/* Per question breakdown */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                  <p className="text-sm font-semibold text-on-surface mb-3">Question Breakdown</p>
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                    {result.results.map((r, i) => (
                      <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                        r.is_correct
                          ? "bg-tertiary-container text-on-tertiary-container"
                          : r.selected === null
                          ? "bg-surface-container text-on-surface-variant"
                          : "bg-error-container text-error"
                      }`}>
                        <span className="font-semibold">Q{r.question}</span>
                        <span>
                          {r.selected ?? "—"} / {r.correct}
                          {r.is_correct ? " ✓" : r.selected ? " ✗" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-surface-container-lowest border border-outline-variant rounded-xl p-10">
                <div className="text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-sm text-on-surface-variant">
                    Results will appear here after evaluation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}