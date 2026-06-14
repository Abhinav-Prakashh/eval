import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function AIAnalytics() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const headers = await getAuthHeader();
      const res = await axios.get(`${BACKEND}/api/results`, { headers });
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.post(`${BACKEND}/api/analytics/analyze`, {}, { headers });
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* Nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="Eval" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-on-surface">Eval</span>
        </div>
        <button onClick={() => navigate("/dashboard")}
          className="text-sm text-on-surface-variant hover:text-on-surface transition">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            AI Learning Analytics
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gemini analyzes your class results and identifies learning gaps
          </p>
        </div>

        {/* Summary before analysis */}
        {!fetching && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {results.length} evaluation{results.length !== 1 ? "s" : ""} ready for analysis
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Gemini will analyze all results and identify patterns
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || results.length === 0}
                className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-semibold py-2.5 px-6 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Analyzing...
                  </>
                ) : "✦ Analyze with Gemini"}
              </button>
            </div>
            {results.length === 0 && (
              <p className="text-xs text-error mt-3">
                No evaluations yet. Scan some OMR sheets first.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-error-container text-error text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="space-y-5">

            {/* Overall summary */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-secondary text-lg">✦</span>
                <h2 className="text-sm font-semibold text-on-surface">Overall Summary</h2>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Learning gaps */}
            {analysis.learning_gaps?.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-error text-lg">⚠</span>
                  <h2 className="text-sm font-semibold text-on-surface">Learning Gaps Identified</h2>
                </div>
                <div className="space-y-3">
                  {analysis.learning_gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-3 bg-error-container/30 rounded-lg px-4 py-3">
                      <span className="text-error font-bold text-sm mt-0.5">{i + 1}.</span>
                      <p className="text-sm text-on-surface">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong areas */}
            {analysis.strong_areas?.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-600 text-lg">✓</span>
                  <h2 className="text-sm font-semibold text-on-surface">Strong Areas</h2>
                </div>
                <div className="space-y-3">
                  {analysis.strong_areas.map((area, i) => (
                    <div key={i} className="flex items-start gap-3 bg-tertiary-container/30 rounded-lg px-4 py-3">
                      <span className="text-green-600 font-bold text-sm mt-0.5">{i + 1}.</span>
                      <p className="text-sm text-on-surface">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-primary text-lg">💡</span>
                  <h2 className="text-sm font-semibold text-on-surface">Recommendations</h2>
                </div>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-container rounded-lg px-4 py-3">
                      <span className="text-primary font-bold text-sm mt-0.5">{i + 1}.</span>
                      <p className="text-sm text-on-surface">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per question analysis */}
            {analysis.question_analysis?.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h2 className="text-sm font-semibold text-on-surface mb-4">Question-wise Performance</h2>
                <div className="space-y-2">
                  {analysis.question_analysis.map((q, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-on-surface-variant w-8">Q{q.question}</span>
                      <div className="flex-1 bg-surface-container rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${q.correct_rate}%`,
                            backgroundColor: q.correct_rate >= 70 ? '#059669' : q.correct_rate >= 40 ? '#d97706' : '#dc2626'
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-on-surface w-10 text-right">
                        {q.correct_rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}