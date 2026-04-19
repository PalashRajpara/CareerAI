import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  getJobDetail,
  getSkillMatch,
  applyForJob,
  saveJob,
  getReviews,
  createReview,
} from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import SkillBadge from "../components/ui/SkillBadge";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [skillMatch, setSkillMatch] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const jobData = await getJobDetail(id);
      setJob(jobData);

      if (user) {
        try {
          const match = await getSkillMatch(id);
          setSkillMatch(match);
        } catch {}
      }

      const revs = await getReviews(jobData.company_id);
      setReviews(revs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await applyForJob(parseInt(id));
      if (res.error) {
        alert(res.error);
      } else {
        setApplied(true);
      }
    } catch {
      alert("Failed to apply");
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await saveJob(parseInt(id));
    setSaved(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    await createReview(job.company_id, reviewRating, reviewText);
    setReviewText("");
    const revs = await getReviews(job.company_id);
    setReviews(revs);
  };

  if (loading) {
    return (
      <PageWrapper title="Loading..." subtitle="">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!job) {
    return (
      <PageWrapper title="Job Not Found" subtitle="">
        <p className="text-gray-400 text-center py-16">This job posting could not be found.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={job.role} subtitle={`at ${job.company_name}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <GlassCard>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Job Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          </GlassCard>

          {/* Required Skills */}
          <GlassCard delay={0.1}>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.split(",").map((skill, i) => (
                  <SkillBadge key={i} skill={skill.trim()} variant="neutral" />
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Skill Match Analysis */}
          {user && skillMatch && (
            <GlassCard delay={0.2}>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Skill Match Analysis</h2>

                {/* Score */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(0,255,200,0.1)" strokeWidth="6" />
                      <circle
                        cx="36" cy="36" r="30" fill="none"
                        stroke="#00ffc8" strokeWidth="6"
                        strokeDasharray={`${(skillMatch.match_score / 100) * 188.5} 188.5`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#00ffc8]">
                      {skillMatch.match_score}%
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Match Score</p>
                    <p className="text-gray-400 text-sm">
                      {skillMatch.matched_skills.length} of {skillMatch.matched_skills.length + skillMatch.missing_skills.length} skills matched
                    </p>
                  </div>
                </div>

                {/* Matched Skills */}
                {skillMatch.matched_skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-[#00ffc8] mb-2">✓ Matching Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillMatch.matched_skills.map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="matched" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {skillMatch.missing_skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-[#ef4444] mb-2">✗ Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillMatch.missing_skills.map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="missing" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Suggestions */}
                {skillMatch.learning_suggestions && Object.keys(skillMatch.learning_suggestions).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[rgba(0,255,200,0.08)]">
                    <h3 className="text-sm font-medium text-[#f59e0b] mb-3">📚 Learning Path</h3>
                    {Object.entries(skillMatch.learning_suggestions).map(([skill, levels]) => (
                      <div key={skill} className="mb-3">
                        <p className="text-white font-medium capitalize">{skill}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(levels).map(([level, topics]) => (
                            <span key={level} className="text-xs text-gray-400">
                              <span className="text-[#06b6d4]">{level}:</span> {topics.join(", ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Reviews */}
          <GlassCard delay={0.3}>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Company Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>

              {user && (
                <form onSubmit={handleReview} className="mb-6 space-y-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400 text-sm">Rating:</span>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReviewRating(r)}
                        className={`text-lg ${r <= reviewRating ? "text-[#f59e0b]" : "text-gray-600"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write a review..."
                    className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition resize-none h-24"
                  />
                  <button type="submit" className="btn-cyber px-4 py-2 rounded-lg text-black text-sm font-medium">
                    Submit Review
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-[rgba(15,23,42,0.4)] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium text-sm">{r.user_name}</span>
                        <span className="text-[#f59e0b] text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      </div>
                      {r.comment && <p className="text-gray-400 text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GlassCard>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Company Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  <span className="text-gray-500">Company:</span>{" "}
                  <span className="text-white">{job.company_name}</span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="text-[#06b6d4]">{job.company_email}</span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Address:</span>{" "}
                  <span className="text-white">{job.company_address}</span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Apply via:</span>{" "}
                  <span className="text-white capitalize">{job.application_method}</span>
                </p>
                {job.company_avg_rating && (
                  <p className="text-gray-400">
                    <span className="text-gray-500">Rating:</span>{" "}
                    <span className="text-[#f59e0b]">★ {job.company_avg_rating}</span>
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Apply Button */}
          <GlassCard delay={0.1}>
            <div className="p-6 space-y-3">
              {job.application_method === "platform" ? (
                <button
                  onClick={handleApply}
                  disabled={applied}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    applied
                      ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 cursor-default"
                      : "btn-cyber text-black"
                  }`}
                >
                  {applied ? "✓ Applied" : "Apply Now"}
                </button>
              ) : (
                <a
                  href={`mailto:${job.company_email}?subject=Application for ${job.role}`}
                  className="block w-full py-3 rounded-lg font-semibold text-center bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-black"
                >
                  Send Email
                </a>
              )}

              {!saved ? (
                <button
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-lg text-gray-300 border border-gray-600 hover:border-[#00ffc8] hover:text-[#00ffc8] transition text-sm"
                >
                  Bookmark Job
                </button>
              ) : (
                <div className="text-center text-[#00ffc8] text-sm py-2">★ Job Saved</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
