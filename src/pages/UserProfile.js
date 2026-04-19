import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadResumeAuth, getNotifications, markAllNotificationsRead } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import SkillBadge from "../components/ui/SkillBadge";

export default function UserProfile() {
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setName(user.name);
    setEmail(user.email);
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data = {};
      if (name !== user.name) data.name = name;
      if (email !== user.email) data.email = email;
      if (password) data.password = password;

      const res = await updateProfile(data);
      if (res.error) {
        setMessage(res.error);
      } else {
        setPassword("");
        setMessage("Profile updated!");
        await refreshProfile();
      }
    } catch {
      setMessage("Failed to update");
    }
    setSaving(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadResumeAuth(file);
      await refreshProfile();
      setMessage("Resume uploaded! Skills updated.");
    } catch {
      setMessage("Failed to upload resume");
    }
    setUploading(false);
  };

  const handleMarkRead = async () => {
    await markAllNotificationsRead();
    await loadNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PageWrapper title="My Profile" subtitle="Manage your account and resume">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account Settings</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00ffc8] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00ffc8] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty to keep current"
                    className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ffc8] transition"
                  />
                </div>
                {message && (
                  <p className={`text-sm ${message.includes("error") || message.includes("Failed") ? "text-red-400" : "text-[#00ffc8]"}`}>
                    {message}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-cyber px-6 py-2 rounded-lg text-black font-medium text-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-6 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm"
                  >
                    Logout
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>

          {/* Resume Management (hidden for admin) */}
          {!user.is_admin && (
            <GlassCard delay={0.1}>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Resume & Skills</h2>

                {user.resume ? (
                  <div className="bg-[rgba(0,255,200,0.03)] rounded-lg p-4 border border-[rgba(0,255,200,0.08)] mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{user.resume.filename}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Uploaded: {new Date(user.resume.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-[#00ffc8] text-sm">Active</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-4">No resume uploaded yet</p>
                )}

                <label className="inline-block cursor-pointer">
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition ${
                    uploading
                      ? "bg-gray-700 text-gray-400 cursor-wait"
                      : "bg-[rgba(0,255,200,0.1)] text-[#00ffc8] border border-[rgba(0,255,200,0.2)] hover:bg-[rgba(0,255,200,0.2)]"
                  }`}>
                    {uploading ? "Uploading..." : user.resume ? "Upload New Resume" : "Upload Resume"}
                  </span>
                </label>

                {user.skills && user.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Extracted Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, i) => (
                        <SkillBadge key={i} skill={skill} variant="matched" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar - Notifications */}
        <div className="space-y-4">
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#00ffc8]/20 text-[#00ffc8]">
                      {unreadCount}
                    </span>
                  )}
                </h2>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkRead}
                    className="text-xs text-gray-400 hover:text-[#00ffc8] transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={`text-sm p-3 rounded-lg ${
                        n.is_read
                          ? "bg-[rgba(15,23,42,0.3)] text-gray-500"
                          : "bg-[rgba(0,255,200,0.03)] text-gray-300 border border-[rgba(0,255,200,0.08)]"
                      }`}
                    >
                      <p>{n.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard delay={0.1}>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Quick Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Skills Detected</span>
                  <span className="text-[#00ffc8] font-medium">{user.skills?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Type</span>
                  <span className="text-white">{user.is_admin ? "Admin" : "Job Seeker"}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
