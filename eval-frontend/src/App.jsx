import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import QuestionGenerator from "./pages/QuestionGenerator";
import QuestionBank from "./pages/QuestionBank";
import OMRGenerator from "./pages/OMRGenerator";
import OMREvaluator from "./pages/OMREvaluator";
import StudentResults from "./pages/StudentResults";
import AIAnalytics from "./pages/AIAnalytics";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><QuestionGenerator /></ProtectedRoute>} />
          <Route path="/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/omr-generator" element={<ProtectedRoute><OMRGenerator /></ProtectedRoute>} />
          <Route path="/omr-evaluator" element={<ProtectedRoute><OMREvaluator /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentResults /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AIAnalytics /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}