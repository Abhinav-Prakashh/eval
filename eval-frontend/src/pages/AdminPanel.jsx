import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    try {
      const headers = await getAuthHeader();
      const res = await axios.get(`${BACKEND}/api/admin/users`, { headers });
      setUsers(res.data.users);
      setIsAdmin(true);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);
    try {
      const headers = await getAuthHeader();
      await axios.post(`${BACKEND}/api/admin/create-user`, form, { headers });
      setSuccess(`Account created for ${form.email}`);
      setForm({ name: "", email: "", password: "" });
      checkAdminAndLoad();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(uid, email) {
    if (!confirm(`Delete account for ${email}?`)) return;
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${BACKEND}/api/admin/users/${uid}`, { headers });
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      setError("Failed to delete user.");
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-on-surface-variant text-sm">Loading...</p>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl mb-2">🚫</p>
        <p className="text-on-surface font-semibold">Not authorized</p>
        <button onClick={() => navigate("/dashboard")}
          className="mt-4 text-sm text-primary hover:underline">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">

      {/* Nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="Eval" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-on-surface">Eval</span>
          <span className="text-xs bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-semibold">Admin</span>
        </div>
        <button
          onClick={() => signOut(auth).then(() => navigate("/login"))}
          className="text-sm text-error font-semibold hover:underline"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Admin Panel</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage teacher accounts</p>
        </div>

        {/* Create user */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Create Teacher Account</h2>

          {error && <div className="bg-error-container text-error text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          {success && <div className="bg-tertiary-container text-on-tertiary-container text-sm px-4 py-3 rounded-lg mb-4">{success}</div>}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                placeholder="Teacher name"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
                placeholder="teacher@school.com"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-primary text-on-primary font-semibold py-2.5 px-6 rounded-lg text-sm hover:bg-primary-container transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        {/* Users list */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="text-sm font-semibold text-on-surface">
              All Users ({users.length})
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant">
                <th className="text-left px-6 py-3 text-xs font-semibold text-on-surface-variant">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-on-surface-variant">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-on-surface-variant">Role</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition">
                  <td className="px-6 py-3 text-sm font-semibold text-on-surface">{u.name || "—"}</td>
                  <td className="px-6 py-3 text-sm text-on-surface-variant">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.email === user?.email
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {u.email === user?.email ? "Admin" : "Teacher"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {u.email !== user?.email && (
                      <button
                        onClick={() => handleDelete(u.uid, u.email)}
                        className="text-xs text-error font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}