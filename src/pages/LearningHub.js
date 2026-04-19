/**
 * LearningHub.js
 * Comprehensive learning hub page showing skill gaps, recommended courses,
 * playlists, tutorials, and an AI-generated learning roadmap.
 * Glassmorphism + neon design system.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLearningHub } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import SkillBadge from "../components/ui/SkillBadge";

/* ── Platform icon/color mapping ── */
const PLATFORM_STYLES = {
  Coursera: { color: "#0056D2", icon: "🎓" },
  Udemy: { color: "#A435F0", icon: "📚" },
  YouTube: { color: "#FF0000", icon: "▶️" },
  freeCodeCamp: { color: "#0A0A23", icon: "🔥" },
};

const DIFFICULTY_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.3)" },
  Intermediate: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  Advanced: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
};

/* ── Tabs ── */
const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "courses", label: "Courses & Resources", icon: "📚" },
];

export default function LearningHub() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const hub = await getLearningHub();
      setData(hub);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <PageWrapper title="Learning Hub" subtitle="Loading your learning recommendations...">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  /* ── No skills extracted state ── */
  if (!data || data.user_skills.length === 0) {
    return (
      <PageWrapper title="Learning Hub" subtitle="AI-powered learning recommendations">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-400 mb-4">Upload your resume first to get personalized learning recommendations</p>
          <Link to="/upload" className="btn-cyber px-6 py-2 rounded-lg text-black text-sm font-medium">
            Upload Resume
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Learning Hub" subtitle="AI-powered skill gap analysis & learning paths">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Your Skills"
          value={data.user_skills.length}
          icon="✅"
          color="#00ffc8"
          delay={0}
        />
        <SummaryCard
          label="Missing Skills"
          value={data.summary.total_missing}
          icon="🎯"
          color="#ef4444"
          delay={0.1}
        />
        <SummaryCard
          label="Courses Available"
          value={data.summary.total_courses}
          icon="📚"
          color="#06b6d4"
          delay={0.2}
        />
        <SummaryCard
          label="Platforms"
          value={data.summary.platforms.length}
          icon="🌐"
          color="#f59e0b"
          delay={0.3}
        />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 shadow-lg shadow-[#00ffc8]/5"
                : "bg-[rgba(15,23,42,0.5)] text-gray-400 border border-white/5 hover:border-white/10 hover:text-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <OverviewTab data={data} />
          </motion.div>
        )}
        {activeTab === "courses" && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CoursesTab
              data={data}
              selectedSkill={selectedSkill}
              setSelectedSkill={setSelectedSkill}
              difficultyFilter={difficultyFilter}
              setDifficultyFilter={setDifficultyFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUMMARY CARD
   ═══════════════════════════════════════════════════════════ */
function SummaryCard({ label, value, icon, color, delay }) {
  return (
    <GlassCard delay={delay}>
      <div className="p-5 text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring" }}
          className="text-3xl font-bold"
          style={{ color }}
        >
          {value}
        </motion.p>
        <p className="text-gray-400 text-xs mt-1">{label}</p>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════ */
function OverviewTab({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Your Skills */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-[#00ffc8]">✅</span> Your Current Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.user_skills.map((skill, i) => (
              <SkillBadge key={i} skill={skill} variant="matched" />
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Missing Skills */}
      <GlassCard delay={0.1}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-[#ef4444]">🎯</span> Skills You Need to Learn
          </h2>
          {data.missing_skills.length === 0 ? (
            <p className="text-gray-400 text-sm">No skill gaps detected — you're well prepared!</p>
          ) : (
            <div className="space-y-3">
              {data.missing_skills.map((gap, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SkillBadge skill={gap.skill} variant="missing" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-[rgba(239,68,68,0.1)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((gap.demand_count / 5) * 100, 100)}%` }}
                        transition={{ delay: i * 0.05, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-[#ef4444] to-[#f97171] rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-14 text-right">{gap.demand_count} jobs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Quick Learning Stats */}
      <GlassCard delay={0.2} className="lg:col-span-2">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-[#06b6d4]">🌐</span> Available Learning Platforms
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.summary.platforms.map((platform, i) => {
              const style = PLATFORM_STYLES[platform] || { color: "#06b6d4", icon: "📖" };
              const courseCount = Object.values(data.skill_resources)
                .flat()
                .filter((r) => r.platform === platform).length;
              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-4 rounded-xl"
                  style={{ background: `${style.color}10`, border: `1px solid ${style.color}30` }}
                >
                  <div className="text-2xl mb-1">{style.icon}</div>
                  <p className="text-white text-sm font-medium">{platform}</p>
                  <p className="text-xs mt-1" style={{ color: style.color }}>
                    {courseCount} resources
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COURSES & RESOURCES TAB
   ═══════════════════════════════════════════════════════════ */
function CoursesTab({ data, selectedSkill, setSelectedSkill, difficultyFilter, setDifficultyFilter }) {
  const missingSkillNames = data.missing_skills.map((s) => s.skill);

  // Filter resources
  const filteredSkills = selectedSkill
    ? [selectedSkill]
    : Object.keys(data.skill_resources);

  return (
    <div>
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Skill filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSkill(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !selectedSkill
                ? "bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30"
                : "bg-[rgba(15,23,42,0.5)] text-gray-400 border border-white/5 hover:border-white/10"
            }`}
          >
            All Skills
          </button>
          {missingSkillNames.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedSkill === skill
                  ? "bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30"
                  : "bg-[rgba(15,23,42,0.5)] text-gray-400 border border-white/5 hover:border-white/10"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 ml-auto">
          {["Beginner", "Intermediate", "Advanced"].map((level) => {
            const dc = DIFFICULTY_COLORS[level];
            return (
              <button
                key={level}
                onClick={() => setDifficultyFilter(difficultyFilter === level ? "" : level)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: difficultyFilter === level ? dc.bg : "rgba(15,23,42,0.5)",
                  color: difficultyFilter === level ? dc.text : "#9ca3af",
                  border: `1px solid ${difficultyFilter === level ? dc.border : "rgba(255,255,255,0.05)"}`,
                }}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Course Cards by Skill ── */}
      <div className="space-y-8">
        {filteredSkills.map((skill) => {
          let courses = data.skill_resources[skill] || [];
          if (difficultyFilter) {
            courses = courses.filter((c) => c.difficulty === difficultyFilter);
          }
          if (courses.length === 0) return null;

          return (
            <div key={skill}>
              <h3 className="text-white font-semibold text-lg capitalize mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ffc8]" />
                {skill}
                <span className="text-xs text-gray-500 font-normal ml-2">
                  {courses.length} resource{courses.length > 1 ? "s" : ""}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course, idx) => (
                  <CourseCard key={course.id} course={course} delay={idx * 0.05} />
                ))}
              </div>
            </div>
          );
        })}

        {filteredSkills.every((skill) => {
          const courses = data.skill_resources[skill] || [];
          return difficultyFilter
            ? courses.filter((c) => c.difficulty === difficultyFilter).length === 0
            : courses.length === 0;
        }) && (
          <div className="text-center py-12 text-gray-500">
            No resources found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single Course Card ── */
function CourseCard({ course, delay }) {
  const platform = PLATFORM_STYLES[course.platform] || { color: "#06b6d4", icon: "📖" };
  const diff = DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.Beginner;

  return (
    <GlassCard delay={delay}>
      <div className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}
          >
            {course.difficulty}
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
            style={{ background: `${platform.color}15`, color: platform.color }}
          >
            {platform.icon} {course.platform}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 flex-1">
          {course.course_name}
        </h4>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          {course.duration && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              ⏱️ {course.duration}
            </span>
          )}
          <span className="text-gray-500 text-xs capitalize flex items-center gap-1">
            📁 {course.resource_type}
          </span>
        </div>

        {/* CTA */}
        <a
          href={course.course_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-[#00ffc8]/10 to-[#06b6d4]/10 text-[#00ffc8] border border-[#00ffc8]/20 hover:border-[#00ffc8]/50 hover:shadow-lg hover:shadow-[#00ffc8]/10"
        >
          Start Learning →
        </a>
      </div>
    </GlassCard>
  );
}
