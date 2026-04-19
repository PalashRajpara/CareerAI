/**
 * Results.js
 * Interactive 3D career recommendation results with animated cards,
 * skill badges, match percentage visualization, and glassmorphism design.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/ui/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import CircularProgress from '../components/ui/CircularProgress';
import SkillBadge from '../components/ui/SkillBadge';

function Results({ result }) {
  if (!result) {
    return (
      <PageWrapper title="AI Analysis Results" subtitle="Your career recommendations will appear here">
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00ffc8]/10 to-[#06b6d4]/10 border border-[#00ffc8]/20 flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Results Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md">Upload and analyze your resume first to see AI-powered career recommendations.</p>
            <Link to="/upload" className="no-underline">
              <button className="btn-cyber px-6 py-3 rounded-xl">Upload Resume →</button>
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="AI Career Recommendations"
      subtitle={`Found ${result.career_recommendations.length} career matches based on ${result.extracted_skills.length} detected skills`}
    >
      {/* Extracted Skills Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10 p-6 rounded-2xl bg-[rgba(15,23,42,0.4)] backdrop-blur-xl border border-[rgba(0,255,200,0.08)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/20 flex items-center justify-center text-sm">✦</div>
          <h3 className="text-lg font-semibold text-white">Detected Skills</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs font-medium">{result.extracted_skills.length} found</span>
        </div>
        <div className="flex flex-wrap">
          {result.extracted_skills.map((skill, i) => (
            <SkillBadge key={skill} skill={skill} index={i} variant="neutral" />
          ))}
        </div>
      </motion.div>

      {/* Career Recommendation Cards */}
      <div className="space-y-8">
        {result.career_recommendations.map((job, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.15 }}
          >
            <GlassCard
              className="relative overflow-hidden"
              delay={0}
              glow={index === 0}
            >
              {/* Rank badge */}
              {index === 0 && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#00ffc8]/20 to-[#06b6d4]/20 border border-[#00ffc8]/30 text-[#00ffc8] text-xs font-bold">
                  ⭐ Best Match
                </div>
              )}

              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Circular Progress */}
                <div className="flex-shrink-0">
                  <CircularProgress value={job.match_percentage} label="Match" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-white mb-4">{job.job_role}</h3>

                  {/* Matched Skills */}
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2 font-medium">
                      ✅ Matched Skills ({job.matched_skills?.length || 0})
                    </p>
                    <div className="flex flex-wrap">
                      {job.matched_skills?.length > 0 ? (
                        job.matched_skills.map((s, i) => (
                          <SkillBadge key={s} skill={s} index={i} variant="matched" />
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">No direct matches</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <p className="text-sm text-slate-400 mb-2 font-medium">
                      ⚠️ Skills to Learn ({job.missing_skills?.length || 0})
                    </p>
                    <div className="flex flex-wrap">
                      {job.missing_skills?.length > 0 ? (
                        job.missing_skills.map((s, i) => (
                          <SkillBadge key={s} skill={s} index={i} variant="missing" />
                        ))
                      ) : (
                        <span className="text-[#00ffc8] text-sm font-medium">🎉 No skill gaps — you're fully qualified!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom progress bar */}
              <div className="mt-6 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${job.match_percentage}%` }}
                  transition={{ delay: 0.8 + index * 0.15, duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #00ffc8, #06b6d4)`,
                    boxShadow: '0 0 10px rgba(0, 255, 200, 0.4)',
                  }}
                />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 flex flex-wrap gap-4 justify-center"
      >
        {[
          { to: '/strength', label: 'Skill Strength', icon: '⚡' },
          { to: '/dashboard', label: 'Dashboard', icon: '▦' },
        ].map((link, i) => (
          <Link key={i} to={link.to} className="no-underline">
            <button className="btn-cyber px-5 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          </Link>
        ))}
      </motion.div>
    </PageWrapper>
  );
}

export default Results;
