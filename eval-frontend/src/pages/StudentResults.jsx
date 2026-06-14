import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function StudentResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [search, setSearch] = useState("");

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
      setLoading(false);
    }
  }

  const filtered = results
    .filter(r =>
      (r.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.roll_number || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
      if (sortBy === "score_high") return b.percentage - a.percentage;
      if (sortBy === "score_low") return a.percentage - b.percentage;
      if (sortBy === "name") return (a.student_name || "").localeCompare(b.student_name || "");
      return 0;
    });

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;
  const passed = results.filter(r => r.percentage >= 50).length;
  const failed = results.filter(r => r.percentage < 50).length;

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

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Student Results</h1>
          <p className="text-sm text-on-surface-variant mt-1">All evaluated OMR sheets with student scores</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant">Total Students</p>
            <p className="text-3xl font-bold text-on-surface mt-1">{results.length}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant">Class Average</p>
            <p className="text-3xl font-bold text-primary mt-1">{avg}%</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center">
            <p className="text-xs text-on-surface-variant">Pass / Fail</p>
            <p className="text-3xl font-bold mt-1">
              <span className="text-green-600">{passed}</span>
              <span className="text-on-surface-variant text-xl"> / </span>
              <span className="text-red-600">{failed}</span>
            </p>
          </div>
        </div>

        {/* Search and sort */}
        <div className="flex gap-3 mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or roll number..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date">Sort: Latest first</option>
            <option value="score_high">Sort: Highest score</option>
            <option value="score_low">Sort: Lowest score</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>

        {/* Results table */}
        {loading ? (
          <div className="text-center py-20 text-on-surface-variant text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest border border-outline-variant rounded-xl">
            <p className="text-4xl mb-3">👩‍🎓</p>
            <p className="text-on-surface font-semibold">No results yet</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">Evaluate OMR sheets to see student scores here</p>
            <button onClick={() => navigate("/omr-evaluator")}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold">
              Evaluate a Sheet
            </button>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Roll No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">Student Name</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant">Score</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant">Percentage</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id || i}
                    className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition">
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {r.roll_number || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-on-surface">
                        {r.student_name || "Unknown Student"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-on-surface">
                        {r.score}/{r.total}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${
                        r.percentage >= 80 ? "text-green-600" :
                        r.percentage >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        r.percentage >= 50
                          ? "bg-tertiary-container text-on-tertiary-container"
                          : "bg-error-container text-error"
                      }`}>
                        {r.percentage >= 50 ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-outline">
                      {r.timestamp?.seconds
                        ? new Date(r.timestamp.seconds * 1000).toLocaleDateString()
                        : "Just now"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}