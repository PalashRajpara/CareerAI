import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getJobs,
  getCompanies,
  saveJob,
  getSavedJobs,
  getSkillMatch,
} from "../api";
import GlassCard from "../components/ui/GlassCard";
import PageWrapper from "../components/ui/PageWrapper";
import SkillBadge from "../components/ui/SkillBadge";

export default function DiscoverJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [skillMatches, setSkillMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("jobs"); // jobs | companies

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, companiesData] = await Promise.all([
        getJobs(),
        getCompanies(),
      ]);
      setJobs(jobsData);
      setCompanies(companiesData);

      if (user) {
        const saved = await getSavedJobs();
        setSavedJobIds(new Set(saved.map((s) => s.job_id)));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const data = await getJobs(search, skillFilter);
    setJobs(data);
    setLoading(false);
  };

  const handleSave = async (jobId) => {
    if (!user) return;
    await saveJob(jobId);
    setSavedJobIds((prev) => new Set([...prev, jobId]));
  };

  const loadSkillMatch = async (jobId) => {
    if (!user || skillMatches[jobId]) return;
    const data = await getSkillMatch(jobId);
    setSkillMatches((prev) => ({ ...prev, [jobId]: data }));
  };

  const filteredJobs = jobs;

  return (
    <PageWrapper title="Discover Opportunities" subtitle="Browse companies and find your perfect role">
      {/* View Toggle & Search */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setView("jobs")}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              view === "jobs"
                ? "bg-[#00ffc8] text-black"
                : "glass text-gray-300 hover:text-white"
            }`}
          >
            Job Listings
          </button>
          <button
            onClick={() => setView("companies")}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              view === "companies"
                ? "bg-[#00ffc8] text-black"
                : "glass text-gray-300 hover:text-white"
            }`}
          >
            Companies
          </button>
        </div>

        {view === "jobs" && (
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 min-w-[200px] bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition"
            />
            <input
              type="text"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-48 bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition"
            />
            <button onClick={handleSearch} className="btn-cyber px-6 py-2.5 rounded-lg text-black font-medium">
              Search
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : view === "jobs" ? (
        /* ==================== JOBS VIEW ==================== */
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No jobs found</div>
          ) : (
            filteredJobs.map((job, i) => (
              <GlassCard key={job.id} delay={i * 0.05}>
                <div className="p-6">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div className="flex-1">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-xl font-bold text-white hover:text-[#00ffc8] transition"
                      >
                        {job.role}
                      </Link>
                      <p className="text-[#06b6d4] mt-1">{job.company_name}</p>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        job.application_method === "platform"
                          ? "bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/30"
                          : "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30"
                      }`}>
                        {job.application_method === "platform" ? "Apply Here" : "Email"}
                      </span>
                      {user && !savedJobIds.has(job.id) && (
                        <button
                          onClick={() => handleSave(job.id)}
                          className="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-400 hover:border-[#00ffc8] hover:text-[#00ffc8] transition"
                        >
                          Save
                        </button>
                      )}
                      {savedJobIds.has(job.id) && (
                        <span className="text-xs px-3 py-1 rounded-full bg-[#00ffc8]/10 text-[#00ffc8]">
                          ★ Saved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.required_skills.split(",").map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-full bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[rgba(6,182,212,0.2)]"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Skill Match (logged in users) */}
                  {user && (
                    <div className="mt-4">
                      {!skillMatches[job.id] ? (
                        <button
                          onClick={() => loadSkillMatch(job.id)}
                          className="text-sm text-[#00ffc8] hover:underline"
                        >
                          View Skill Match →
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-[rgba(0,255,200,0.03)] rounded-lg p-4 border border-[rgba(0,255,200,0.08)]"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-[#00ffc8]">
                              {skillMatches[job.id].match_score}%
                            </span>
                            <span className="text-gray-400 text-sm">Match Score</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {skillMatches[job.id].matched_skills.map((s, idx) => (
                              <SkillBadge key={idx} skill={s} variant="matched" />
                            ))}
                            {skillMatches[job.id].missing_skills.map((s, idx) => (
                              <SkillBadge key={idx} skill={s} variant="missing" />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm px-4 py-2 rounded-lg bg-[rgba(0,255,200,0.1)] text-[#00ffc8] border border-[rgba(0,255,200,0.2)] hover:bg-[rgba(0,255,200,0.2)] transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      ) : (
        /* ==================== COMPANIES VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company, i) => (
            <GlassCard key={company.id} delay={i * 0.05}>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white">{company.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{company.address}</p>
                <p className="text-[#06b6d4] text-sm mt-1">{company.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-300">
                    {company.job_count} open position{company.job_count !== 1 ? "s" : ""}
                  </span>
                  {company.avg_rating && (
                    <span className="text-sm text-[#f59e0b]">
                      ★ {company.avg_rating} ({company.review_count} review{company.review_count !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
