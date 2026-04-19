import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getCareerInsights, getRecommendations } from "../api";
import { Link } from "react-router-dom";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import SkillBadge from "../components/ui/SkillBadge";

export default function CareerInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [insightsData, recsData] = await Promise.all([
        getCareerInsights(),
        getRecommendations(),
      ]);
      setInsights(insightsData);
      setRecommendations(recsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <PageWrapper title="Career Insights" subtitle="Loading your personalized insights...">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!insights || insights.top_skills.length === 0) {
    return (
      <PageWrapper title="Career Insights" subtitle="Your personalized career analysis">
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Upload your resume first to see career insights</p>
          <Link to="/upload" className="btn-cyber px-6 py-2 rounded-lg text-black text-sm font-medium">
            Upload Resume
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Career Insights" subtitle="Your personalized AI career analysis">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <GlassCard>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Skills</h2>
            <div className="flex flex-wrap gap-2">
              {insights.top_skills.map((skill, i) => (
                <SkillBadge key={i} skill={skill} variant="matched" />
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Skill Gaps */}
        <GlassCard delay={0.1}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Skill Gaps</h2>
            {insights.skill_gaps.length === 0 ? (
              <p className="text-gray-400 text-sm">No significant skill gaps detected!</p>
            ) : (
              <div className="space-y-3">
                {insights.skill_gaps.map((gap, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{gap.skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[rgba(239,68,68,0.1)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((gap.demand_count / 5) * 100, 100)}%` }}
                          transition={{ delay: i * 0.1, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-[#ef4444] to-[#f97171] rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-500">{gap.demand_count} jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recommended Roles */}
        <GlassCard delay={0.2}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recommended Roles</h2>
            <div className="space-y-3">
              {insights.recommended_roles.map((role, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{role.role}</p>
                    <p className="text-gray-500 text-xs">{role.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-[rgba(0,255,200,0.1)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${role.score}%` }}
                        transition={{ delay: i * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-[#00ffc8] to-[#06b6d4] rounded-full"
                      />
                    </div>
                    <span className="text-[#00ffc8] text-sm font-medium w-12 text-right">{role.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Resume Tips */}
        <GlassCard delay={0.3}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Resume Improvement Tips</h2>
            <div className="space-y-3">
              {insights.resume_tips.map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[#f59e0b] mt-0.5 flex-shrink-0">💡</span>
                  <p className="text-gray-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Job Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold neon-text mb-4">Recommended Jobs For You</h2>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <GlassCard key={rec.id} delay={i * 0.05}>
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <Link
                      to={`/jobs/${rec.id}`}
                      className="text-white font-semibold hover:text-[#00ffc8] transition"
                    >
                      {rec.role}
                    </Link>
                    <p className="text-[#06b6d4] text-sm">{rec.company_name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.matched_skills.map((s, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-[#00ffc8]/10 text-[#00ffc8]">
                          {s}
                        </span>
                      ))}
                      {rec.missing_skills.map((s, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#00ffc8]">{rec.match_score}%</p>
                    <p className="text-gray-500 text-xs">match</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
