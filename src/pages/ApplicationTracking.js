import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApplications, getSavedJobs, unsaveJob } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";

const statusColors = {
  Applied: { bg: "bg-[#06b6d4]/10", text: "text-[#06b6d4]", border: "border-[#06b6d4]/30" },
  Pending: { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", border: "border-[#f59e0b]/30" },
  Accepted: { bg: "bg-[#10b981]/10", text: "text-[#10b981]", border: "border-[#10b981]/30" },
  Rejected: { bg: "bg-[#ef4444]/10", text: "text-[#ef4444]", border: "border-[#ef4444]/30" },
};

const MAIN_TABS = [
  { key: "applications", label: "Applications", icon: "📋" },
  { key: "saved", label: "Saved Jobs", icon: "★" },
];

export default function ApplicationTracking() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [appsData, savedData] = await Promise.all([getApplications(), getSavedJobs()]);
      setApplications(appsData);
      setSaved(savedData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUnsave = async (savedId) => {
    await unsaveJob(savedId);
    setSaved((prev) => prev.filter((s) => s.id !== savedId));
  };

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "Applied").length,
    pending: applications.filter((a) => a.status === "Pending").length,
    accepted: applications.filter((a) => a.status === "Accepted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    saved: saved.length,
  };

  return (
    <PageWrapper title="Applications & Saved" subtitle="Track your job applications and bookmarked opportunities">
      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Total", value: stats.total, color: "#e2e8f0" },
          { label: "Applied", value: stats.applied, color: "#06b6d4" },
          { label: "Pending", value: stats.pending, color: "#f59e0b" },
          { label: "Accepted", value: stats.accepted, color: "#10b981" },
          { label: "Rejected", value: stats.rejected, color: "#ef4444" },
          { label: "Saved", value: stats.saved, color: "#a855f7" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Tab Toggle */}
      <div className="flex gap-2 mb-6">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 shadow-lg shadow-[#00ffc8]/5"
                : "bg-[rgba(15,23,42,0.5)] text-gray-400 border border-white/5 hover:border-white/10 hover:text-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-xs bg-white/5">
              {tab.key === "applications" ? applications.length : saved.length}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "applications" && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["all", "Applied", "Pending", "Accepted", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    filter === f
                      ? "bg-[#00ffc8] text-black"
                      : "glass text-gray-400 hover:text-white"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">No applications found</p>
                <Link to="/discover" className="btn-cyber px-6 py-2 rounded-lg text-black text-sm font-medium">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((app, i) => {
                  const sc = statusColors[app.status] || statusColors.Applied;
                  return (
                    <GlassCard key={app.id} delay={i * 0.03}>
                      <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <Link
                            to={`/jobs/${app.job_id}`}
                            className="text-white font-semibold hover:text-[#00ffc8] transition"
                          >
                            {app.job_role}
                          </Link>
                          <p className="text-[#06b6d4] text-sm">{app.company_name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-xs">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : saved.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-5xl mb-4">★</p>
                <p className="text-gray-400 mb-4">No saved jobs yet</p>
                <Link to="/discover" className="btn-cyber px-6 py-2 rounded-lg text-black text-sm font-medium">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {saved.map((s, i) => (
                  <GlassCard key={s.id} delay={i * 0.05}>
                    <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex-1">
                        <Link
                          to={`/jobs/${s.job_id}`}
                          className="text-white font-semibold hover:text-[#00ffc8] transition"
                        >
                          {s.job_role}
                        </Link>
                        <p className="text-[#06b6d4] text-sm">{s.company_name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {s.required_skills.split(",").map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[rgba(6,182,212,0.2)]"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs">
                          Saved {new Date(s.saved_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleUnsave(s.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                        >
                          Remove
                        </button>
                        <Link
                          to={`/jobs/${s.job_id}`}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(0,255,200,0.2)] text-[#00ffc8] hover:bg-[rgba(0,255,200,0.1)] transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
