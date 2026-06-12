import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-on-surface">
          Welcome, {user?.displayName || user?.email} 👋
        </h1>
        <p className="text-on-surface-variant mt-2 text-sm">
          Dashboard coming in Phase 6
        </p>
        <button
          onClick={() => navigate("/generate")}
          className="mt-4 px-4 py-2 text-sm font-semibold text-on-primary bg-secondary rounded-lg hover:opacity-90 transition"
        >
          ✦ Generate Questions
        </button>
        <button
          onClick={handleSignOut}
          className="mt-4 ml-3 px-4 py-2 text-sm font-semibold text-error border border-error rounded-lg hover:bg-error-container transition"
        >
          Sign out
        </button>
        <button
          onClick={() => navigate("/question-bank")}
          className="mt-4 ml-3 px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-container transition"
        >
          📋 Question Bank
        </button>
        <button
          onClick={() => navigate("/omr-generator")}
          className="mt-4 ml-3 px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-container transition"
        >
          📄 OMR Sheet
        </button>
        <button
          onClick={() => navigate("/omr-evaluator")}
          className="mt-4 ml-3 px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-container transition"
        >
          🔍 Evaluate OMR
        </button>
      </div>
    </div>
  );
}
