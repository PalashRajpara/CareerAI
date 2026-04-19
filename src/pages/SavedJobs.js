import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSavedJobs, unsaveJob } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";

export default function SavedJobs() {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await getSavedJobs();
      setSaved(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUnsave = async (savedId) => {
    await unsaveJob(savedId);
    setSaved((prev) => prev.filter((s) => s.id !== savedId));
  };

  return (
    <PageWrapper title="Saved Jobs" subtitle="Jobs you've bookmarked for later">
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
    </PageWrapper>
  );
}
