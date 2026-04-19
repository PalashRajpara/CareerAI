/**
 * Profile.js
 * Animated user career profile with glassmorphism cards,
 * editable interest selection, and profile summary.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/ui/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import SkillBadge from '../components/ui/SkillBadge';
import CircularProgress from '../components/ui/CircularProgress';

const careerInterests = [
  'Software Development',
  'Data Science',
  'Machine Learning',
  'Web Development',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'AI Research',
  'Mobile Development',
  'Database Administration',
];

function Profile({ result }) {
  const [interest, setInterest] = useState('');
  const [saved, setSaved] = useState(false);

  if (!result) {
    return (
      <PageWrapper title="Career Profile" subtitle="Your personalized career profile">
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#00ffc8]/10 to-[#06b6d4]/10 border border-[#00ffc8]/20 flex items-center justify-center">
              <span className="text-4xl">◎</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Profile Data</h3>
            <p className="text-slate-400 mb-6">Upload your resume to build your career profile.</p>
            <Link to="/upload" className="no-underline">
              <button className="btn-cyber px-6 py-3 rounded-xl">Upload Resume →</button>
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  const topCareer = result.career_recommendations[0];
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageWrapper
      title="Career Profile"
      subtitle="Your personalized AI-analyzed career profile"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <GlassCard delay={0.2} className="p-8 text-center" glow>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="relative w-24 h-24 mx-auto mb-4"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00ffc8]/20 to-[#06b6d4]/20 border-2 border-[#00ffc8]/30 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00ffc8] border-2 border-[#0a0a0f] flex items-center justify-center">
                <span className="text-[8px] text-black font-bold">AI</span>
              </div>
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-1">Career Candidate</h3>
            <p className="text-slate-400 text-sm mb-4">AI-Analyzed Profile</p>
            <div className="inline-flex px-3 py-1 rounded-full bg-[#00ffc8]/10 border border-[#00ffc8]/20 text-[#00ffc8] text-xs font-medium">
              {result.extracted_skills.length} Skills Detected
            </div>
          </GlassCard>

          {/* Top Career Card */}
          <GlassCard delay={0.4} className="p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Top Career Match</h3>
            <div className="flex items-center gap-4">
              <CircularProgress value={topCareer.match_percentage} size={70} strokeWidth={5} />
              <div>
                <p className="text-white font-bold">{topCareer.job_role}</p>
                <p className="text-[#00ffc8] text-sm">{topCareer.match_percentage}% Match</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <GlassCard delay={0.3} className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#00ffc8]">⚡</span> Your Skills
            </h3>
            <div className="flex flex-wrap">
              {result.extracted_skills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} index={i} variant="matched" />
              ))}
            </div>
          </GlassCard>

          {/* All Career Matches */}
          <GlassCard delay={0.5} className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#06b6d4]">🎯</span> Career Matches
            </h3>
            <div className="space-y-3">
              {result.career_recommendations.map((job, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ffc8]/10 to-[#06b6d4]/10 flex items-center justify-center text-sm font-bold text-[#00ffc8]">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{job.job_role}</p>
                    <div className="w-full h-1 mt-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${job.match_percentage}%` }}
                        transition={{ delay: 0.8 + i * 0.2, duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#00ffc8] to-[#06b6d4]"
                      />
                    </div>
                  </div>
                  <span className="text-[#00ffc8] text-sm font-medium">{job.match_percentage}%</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Career Interest Selector */}
          <GlassCard delay={0.7} className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#10b981]">💡</span> Career Interest
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {careerInterests.map((ci, i) => (
                <button
                  key={i}
                  onClick={() => setInterest(ci)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 border cursor-pointer ${
                    interest === ci
                      ? 'bg-[#00ffc8]/15 border-[#00ffc8]/40 text-[#00ffc8] shadow-[0_0_15px_rgba(0,255,200,0.15)]'
                      : 'bg-transparent border-white/10 text-slate-400 hover:border-[#00ffc8]/20 hover:text-white'
                  }`}
                >
                  {ci}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {interest && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-[#00ffc8]/5 border border-[#00ffc8]/15"
                >
                  <p className="text-sm text-slate-300">
                    Selected Interest: <span className="text-[#00ffc8] font-semibold">{interest}</span>
                  </p>
                  <button
                    onClick={handleSave}
                    className="btn-cyber px-4 py-2 rounded-lg text-sm mt-3"
                  >
                    {saved ? '✓ Saved!' : 'Save Preference'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Profile;
