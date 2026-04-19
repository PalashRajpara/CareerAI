/**
 * Dashboard.js
 * Futuristic analytics dashboard with 3D background, interactive charts,
 * stat cards, and comprehensive career analytics.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import PageWrapper from '../components/ui/PageWrapper';
import GlassCard from '../components/ui/GlassCard';
import CircularProgress from '../components/ui/CircularProgress';

/* Custom chart tooltip */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-xl bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-[rgba(0,255,200,0.2)] text-sm">
        <p className="text-white font-medium">{payload[0].payload.name || payload[0].name}</p>
        <p className="text-[#00ffc8]">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

function Dashboard({ result }) {
  if (!result) {
    return (
      <PageWrapper title="Analytics Dashboard" subtitle="Your career analytics overview">
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00ffc8]/10 to-[#06b6d4]/10 border border-[#00ffc8]/20 flex items-center justify-center">
              <span className="text-4xl">▦</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Analytics Data</h3>
            <p className="text-slate-400 mb-6">Upload your resume to see your career analytics dashboard.</p>
            <Link to="/upload" className="no-underline">
              <button className="btn-cyber px-6 py-3 rounded-xl">Upload Resume →</button>
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  const careers = result.career_recommendations;
  const skills = result.extracted_skills;

  /* Chart data */
  const barData = careers.map((j) => ({
    name: j.job_role,
    match: j.match_percentage,
    gap: 100 - j.match_percentage,
  }));

  const pieData = [
    { name: 'Matched', value: skills.length, color: '#00ffc8' },
    {
      name: 'Missing',
      value: new Set(careers.flatMap((j) => j.missing_skills || [])).size,
      color: '#ef4444',
    },
  ];

  /* Stat cards data */
  const avgMatch = Math.round(careers.reduce((a, b) => a + b.match_percentage, 0) / careers.length);
  const bestMatch = careers[0];
  const totalMissing = new Set(careers.flatMap((j) => j.missing_skills || [])).size;

  const stats = [
    { label: 'Average Match', value: `${avgMatch}%`, icon: '📊', color: '#00ffc8' },
    { label: 'Top Career', value: bestMatch.job_role, icon: '🏆', color: '#06b6d4' },
    { label: 'Skills Found', value: skills.length, icon: '⚡', color: '#10b981' },
    { label: 'Skill Gaps', value: totalMissing, icon: '🔍', color: '#f59e0b' },
  ];

  const barColors = ['#00ffc8', '#06b6d4', '#10b981'];

  return (
    <PageWrapper
      title="Analytics Dashboard"
      subtitle="Comprehensive overview of your career analysis"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <GlassCard key={i} delay={0.2 + i * 0.1} className="p-5 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-slate-500 text-xs font-medium">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Bar Chart */}
        <GlassCard delay={0.5} className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-[#00ffc8]">▊</span> Career Match Scores
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="match" radius={[8, 8, 0, 0]} barSize={50}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pie Chart */}
        <GlassCard delay={0.6} className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-[#06b6d4]">◉</span> Skill Distribution
          </h3>
          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Career Cards with Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {careers.map((job, i) => (
          <GlassCard key={i} delay={0.7 + i * 0.1} className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <CircularProgress value={job.match_percentage} size={100} strokeWidth={6} />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">{job.job_role}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400 px-2">
                <span>Matched</span>
                <span className="text-[#00ffc8] font-medium">{job.matched_skills?.length || 0} skills</span>
              </div>
              <div className="flex justify-between text-slate-400 px-2">
                <span>Missing</span>
                <span className="text-red-400 font-medium">{job.missing_skills?.length || 0} skills</span>
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="mt-4 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${job.match_percentage}%` }}
                transition={{ delay: 1 + i * 0.2, duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#00ffc8] to-[#06b6d4]"
                style={{ boxShadow: '0 0 10px rgba(0, 255, 200, 0.4)' }}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </PageWrapper>
  );
}

export default Dashboard;
