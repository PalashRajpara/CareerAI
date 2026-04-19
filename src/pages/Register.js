import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      if (data.error) {
        setError(data.error);
      } else {
        login(data.token, data.user);
        navigate("/discover");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 border border-[rgba(0,255,200,0.1)]">
          <h1 className="text-3xl font-bold neon-text mb-2 text-center">Create Account</h1>
          <p className="text-gray-400 text-center mb-8">Join the AI Career Platform</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber py-3 rounded-lg font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#00ffc8] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
