import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const headers = await getAuthHeader();
      const [resultsRes, questionsRes] = await Promise.all([
        axios.get(`${BACKEND}/api/results`, { headers }),
        axios.get(`${BACKEND}/api/questions`, { headers }),
      ]);
      setResults(resultsRes.data.results);
      setQuestions(questionsRes.data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    navigate("/login");
  }

  // Stats
  const totalEvals = results.length;
  const avgScore = totalEvals > 0
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / totalEvals)
    : 0;
  const totalQuestions = questions.length;
  const highScore = totalEvals > 0
    ? Math.max(...results.map(r => r.percentage))
    : 0;

  // Chart data — last 10 evaluations
  const chartData = [...results]
    .sort((a, b) => {
      const ta = a.timestamp?.seconds || 0;
      const tb = b.timestamp?.seconds || 0;
      return ta - tb;
    })
    .slice(-10)
    .map((r, i) => ({
      name: `Eval ${i + 1}`,
      score: r.percentage,
      correct: r.score,
      total: r.total,
    }));

  // Score distribution
  const distribution = [
    { range: "0-20%", count: results.filter(r => r.percentage <= 20).length, color: "#dc2626" },
    { range: "21-40%", count: results.filter(r => r.percentage > 20 && r.percentage <= 40).length, color: "#f97316" },
    { range: "41-60%", count: results.filter(r => r.percentage > 40 && r.percentage <= 60).length, color: "#eab308" },
    { range: "61-80%", count: results.filter(r => r.percentage > 60 && r.percentage <= 80).length, color: "#22c55e" },
    { range: "81-100%", count: results.filter(r => r.percentage > 80).length, color: "#059669" },
  ];

  return (
    <div className="min-h-screen bg-surface">

      {/* Nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="Eval" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-on-surface">Eval</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant hidden sm:block">
            {user?.displayName || user?.email}
          </span>
          <button onClick={handleSignOut}
            className="text-sm text-error font-semibold hover:underline">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Teacher'} 👋
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Here's your classroom overview
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Generate Questions", icon: "✦", path: "/generate", color: "bg-secondary" },
            { label: "Question Bank", icon: "📋", path: "/question-bank", color: "bg-primary" },
            { label: "OMR Sheet", icon: "📄", path: "/omr-generator", color: "bg-primary" },
            { label: "Evaluate OMR", icon: "🔍", path: "/omr-evaluator", color: "bg-primary" },
            { label: "Student Results", icon: "👩‍🎓", path: "/students", color: "bg-primary" },
            { label: "AI Analytics", icon: "✦", path: "/analytics", color: "bg-secondary" },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-on-primary rounded-xl p-4 text-left hover:opacity-90 transition`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-semibold">{action.label}</div>
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Evaluations", value: totalEvals, sub: "OMR sheets scanned" },
            { label: "Average Score", value: `${avgScore}%`, sub: "across all evals" },
            { label: "Question Bank", value: totalQuestions, sub: "questions saved" },
            { label: "Best Score", value: `${highScore}%`, sub: "highest result" },
          ].map(stat => (
            <div key={stat.label}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
              <p className="text-2xl font-bold text-on-surface mt-1">{stat.value}</p>
              <p className="text-xs text-outline mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant text-sm">Loading...</div>
        ) : results.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-on-surface font-semibold">No evaluations yet</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-4">
              Scan an OMR sheet to see performance data here
            </p>
            <button onClick={() => navigate("/omr-evaluator")}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-container transition">
              Evaluate a Sheet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Score trend */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-semibold text-on-surface mb-4">Score Trend</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Line
                    type="monotone" dataKey="score"
                    stroke="#00288e" strokeWidth={2}
                    dot={{ fill: "#00288e", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Score distribution */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-semibold text-on-surface mb-4">Score Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent evaluations */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-semibold text-on-surface mb-4">Recent Evaluations</h2>
              <div className="space-y-2">
                {[...results]
                  .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
                  .slice(0, 8)
                  .map((r, i) => (
                    <div key={r.id || i}
                      className="flex items-center justify-between px-4 py-3 bg-surface-container rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          r.percentage >= 80 ? "bg-green-500" :
                          r.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                        }`}/>
                        <span className="text-sm text-on-surface">
                          {r.score}/{r.total} questions correct
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-bold ${
                          r.percentage >= 80 ? "text-green-600" :
                          r.percentage >= 50 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {r.percentage}%
                        </span>
                        <span className="text-xs text-outline">
                          {r.timestamp?.seconds
                            ? new Date(r.timestamp.seconds * 1000).toLocaleDateString()
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}