/**
 * SkillStrength.js
 * Interactive skill strength visualization with animated bar charts,
 * radar-style display, and 3D skill graph.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import PageWrapper from '../components/ui/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import SkillBadge from '../components/ui/SkillBadge';

/* Custom tooltip for charts */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-xl bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-[rgba(0,255,200,0.2)] text-sm">
        <p className="text-white font-medium">{payload[0].payload.skill || payload[0].payload.name}</p>
        <p className="text-[#00ffc8]">Strength: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

function SkillStrength({ result }) {
  if (!result) {
    return (
      <PageWrapper title="Skill Strength Analysis" subtitle="Your skill assessment will appear here">
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00ffc8]/10 to-[#06b6d4]/10 border border-[#00ffc8]/20 flex items-center justify-center">
              <span className="text-4xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Skills Data</h3>
            <p className="text-slate-400 mb-6">Upload your resume to see a skill strength analysis.</p>
            <Link to="/upload" className="no-underline">
              <button className="btn-cyber px-6 py-3 rounded-xl">Upload Resume →</button>
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  const skills = result.extracted_skills;

  /* Build skill data: score each skill based on how many jobs require it */
  const skillData = skills.map((skill) => {
    const matchCount = result.career_recommendations.filter(
      (job) => job.matched_skills?.includes(skill)
    ).length;
    const strength = Math.round((matchCount / result.career_recommendations.length) * 100);
    return { skill, name: skill, strength: Math.max(strength, 30), fullMark: 100 };
  });

  /* Categorize skills by strength level */
  const expert = skillData.filter((s) => s.strength >= 80);
  const proficient = skillData.filter((s) => s.strength >= 50 && s.strength < 80);
  const developing = skillData.filter((s) => s.strength < 50);

  const barColors = ['#00ffc8', '#06b6d4', '#10b981', '#0ea5e9', '#00ffaa', '#14b8a6', '#22d3ee', '#34d399'];

  return (
    <PageWrapper
      title="Skill Strength Analysis"
      subtitle={`Analyzing ${skills.length} skills detected from your resume`}
    >
      {/* Skill Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <GlassCard className="p-8" glow>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-[#00ffc8]">◈</span> Skill Radar Overview
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <RadarChart data={skillData}>
                <PolarGrid stroke="rgba(0,255,200,0.1)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Radar
                  name="Strength"
                  dataKey="strength"
                  stroke="#00ffc8"
                  fill="#00ffc8"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Skill Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-[#06b6d4]">▊</span> Skill Strength Breakdown
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={skillData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="strength" radius={[0, 6, 6, 0]} barSize={20}>
                  {skillData.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Expert */}
        <GlassCard delay={0.6} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏆</span>
            <h3 className="text-lg font-bold text-[#00ffc8]">Expert</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-[#00ffc8]/10 text-[#00ffc8] text-xs">{expert.length}</span>
          </div>
          <div className="flex flex-wrap">
            {expert.length > 0 ? expert.map((s, i) => (
              <SkillBadge key={s.skill} skill={s.skill} index={i} variant="matched" />
            )) : <span className="text-slate-500 text-sm">Build more experience</span>}
          </div>
        </GlassCard>

        {/* Proficient */}
        <GlassCard delay={0.7} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <h3 className="text-lg font-bold text-[#06b6d4]">Proficient</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] text-xs">{proficient.length}</span>
          </div>
          <div className="flex flex-wrap">
            {proficient.length > 0 ? proficient.map((s, i) => (
              <SkillBadge key={s.skill} skill={s.skill} index={i} variant="neutral" />
            )) : <span className="text-slate-500 text-sm">Keep practicing</span>}
          </div>
        </GlassCard>

        {/* Developing */}
        <GlassCard delay={0.8} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🌱</span>
            <h3 className="text-lg font-bold text-[#f59e0b]">Developing</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-xs">{developing.length}</span>
          </div>
          <div className="flex flex-wrap">
            {developing.length > 0 ? developing.map((s, i) => (
              <SkillBadge key={s.skill} skill={s.skill} index={i} variant="missing" />
            )) : <span className="text-slate-500 text-sm">Great coverage!</span>}
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

export default SkillStrength;
