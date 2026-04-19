/**
 * LearningRoadmaps.js
 * Selectable Learning Roadmaps — users choose a skill and see a structured
 * step-by-step learning path with resources.
 * Glassmorphism + neon design system.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSkillRoadmaps, getSkillRoadmap, getSuggestedRoadmaps } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";

/* ── Skill icon & accent mapping ── */
const SKILL_META = {
  "Machine Learning": { icon: "🤖", accent: "#a855f7", emoji: "🧠" },
  "Data Science":     { icon: "📊", accent: "#06b6d4", emoji: "📈" },
  "Python":           { icon: "🐍", accent: "#3b82f6", emoji: "💻" },
  "Web Development":  { icon: "🌐", accent: "#10b981", emoji: "🖥️" },
  "React":            { icon: "⚛️", accent: "#61dafb", emoji: "⚡" },
  "Docker":           { icon: "🐳", accent: "#2496ed", emoji: "📦" },
  "Cybersecurity":    { icon: "🔒", accent: "#ef4444", emoji: "🛡️" },
};

const PLATFORM_STYLES = {
  Coursera:     { color: "#0056D2", icon: "🎓" },
  Udemy:        { color: "#A435F0", icon: "📚" },
  YouTube:      { color: "#FF0000", icon: "▶️" },
  freeCodeCamp: { color: "#0A0A23", icon: "🔥" },
  Kaggle:       { color: "#20BEFF", icon: "📊" },
  PortSwigger:  { color: "#FF6633", icon: "🔐" },
  TryHackMe:    { color: "#212C42", icon: "🎯" },
};

export default function LearningRoadmaps() {
  const { user } = useAuth();
  const [roadmapList, setRoadmapList] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [roadmapDetail, setRoadmapDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    setLoading(true);
    try {
      const [list, sug] = await Promise.all([
        getSkillRoadmaps(),
        getSuggestedRoadmaps(),
      ]);
      setRoadmapList(list);
      setSuggested(sug);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const selectSkill = async (skillName) => {
    if (selectedSkill === skillName) {
      setSelectedSkill(null);
      setRoadmapDetail(null);
      return;
    }
    setSelectedSkill(skillName);
    setDetailLoading(true);
    try {
      const detail = await getSkillRoadmap(skillName);
      setRoadmapDetail(detail);
    } catch (e) {
      console.error(e);
    }
    setDetailLoading(false);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <PageWrapper title="Learning Roadmaps" subtitle="Loading available roadmaps...">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  /* ── Suggested roadmaps banner (from resume analysis) ── */
  const suggestedNames = new Set(suggested.map((s) => s.skill_name));

  return (
    <PageWrapper title="Learning Roadmaps" subtitle="Choose a skill and follow a structured learning path">
      {/* ── Suggested Roadmaps (resume-integrated) ── */}
      {suggested.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h2 className="text-white font-semibold text-lg">Suggested For You</h2>
                  <p className="text-gray-400 text-sm">Based on skills missing from your resume</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {suggested.map((sug, i) => {
                  const meta = SKILL_META[sug.skill_name] || { icon: "📖", accent: "#00ffc8" };
                  return (
                    <motion.button
                      key={sug.skill_name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => selectSkill(sug.skill_name)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                      style={{
                        background: selectedSkill === sug.skill_name ? `${meta.accent}20` : "rgba(239,68,68,0.06)",
                        color: selectedSkill === sug.skill_name ? meta.accent : "#f87171",
                        border: `1px solid ${selectedSkill === sug.skill_name ? `${meta.accent}40` : "rgba(239,68,68,0.15)"}`,
                      }}
                    >
                      <span>{meta.icon}</span>
                      Start {sug.skill_name} Roadmap
                      <span className="text-xs opacity-60">({sug.step_count} steps)</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Skill Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {roadmapList.map((rm, i) => {
          const meta = SKILL_META[rm.skill_name] || { icon: "📖", accent: "#00ffc8", emoji: "🎓" };
          const isSelected = selectedSkill === rm.skill_name;
          const isSuggested = suggestedNames.has(rm.skill_name);

          return (
            <motion.div
              key={rm.skill_name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => selectSkill(rm.skill_name)}
                className="w-full text-left group"
              >
                <div
                  className="relative p-5 rounded-2xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${meta.accent}15, ${meta.accent}05)`
                      : "rgba(15,23,42,0.5)",
                    border: `1px solid ${isSelected ? `${meta.accent}40` : "rgba(255,255,255,0.05)"}`,
                    backdropFilter: "blur(20px)",
                    boxShadow: isSelected ? `0 0 30px ${meta.accent}10` : "none",
                  }}
                >
                  {/* Suggested badge */}
                  {isSuggested && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                        Missing Skill
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                    style={{ background: `${meta.accent}12`, border: `1px solid ${meta.accent}25` }}
                  >
                    {meta.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold mb-1">{rm.skill_name}</h3>
                  <p className="text-gray-500 text-xs mb-3">{rm.step_count} structured steps</p>

                  {/* CTA */}
                  <div
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-all"
                    style={{ color: meta.accent }}
                  >
                    {isSelected ? "Hide Roadmap" : "View Roadmap"} →
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── Roadmap Detail ── */}
      <AnimatePresence mode="wait">
        {selectedSkill && (
          <motion.div
            key={selectedSkill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {detailLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : roadmapDetail ? (
              <RoadmapDetail data={roadmapDetail} />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Link to Learning Hub ── */}
      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm mb-3">
          Want AI-powered recommendations based on your resume?
        </p>
        <Link
          to="/learning-hub"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/20 hover:border-[#00ffc8]/50 transition-all"
        >
          📖 Go to Learning Hub →
        </Link>
      </div>
    </PageWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROADMAP DETAIL — Step-by-step timeline
   ═══════════════════════════════════════════════════════════ */
function RoadmapDetail({ data }) {
  const meta = SKILL_META[data.skill_name] || { icon: "📖", accent: "#00ffc8", emoji: "🎓" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: `${meta.accent}12`, border: `1px solid ${meta.accent}25` }}
        >
          {meta.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{data.skill_name} Roadmap</h2>
          <p className="text-gray-400 text-sm">{data.total_steps} steps to mastery</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5 hidden md:block"
          style={{ background: `linear-gradient(to bottom, ${meta.accent}40, transparent)` }}
        />

        <div className="space-y-4">
          {data.steps.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} accent={meta.accent} totalSteps={data.total_steps} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP CARD — Single roadmap step
   ═══════════════════════════════════════════════════════════ */
function StepCard({ step, index, accent, totalSteps }) {
  const [expanded, setExpanded] = useState(false);
  const platform = PLATFORM_STYLES[step.platform] || { color: "#06b6d4", icon: "📖" };
  const progress = Math.round(((index + 1) / totalSteps) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative md:pl-16"
    >
      {/* Step number bubble (timeline) */}
      <div
        className="hidden md:flex absolute left-0 top-5 w-12 h-12 rounded-full items-center justify-center text-sm font-bold z-10"
        style={{
          background: `${accent}18`,
          color: accent,
          border: `2px solid ${accent}40`,
          boxShadow: `0 0 20px ${accent}15`,
        }}
      >
        {step.step_number}
      </div>

      <GlassCard delay={index * 0.06}>
        <div className="p-5">
          {/* Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-start justify-between text-left gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                {/* Mobile step number */}
                <span
                  className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
                >
                  {step.step_number}
                </span>
                <h3 className="text-white font-semibold text-base">{step.step_title}</h3>
              </div>

              {/* Description */}
              {step.description && (
                <p className="text-gray-400 text-sm mt-1 md:ml-0 ml-11">{step.description}</p>
              )}
            </div>

            {/* Progress mini */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-xs font-medium" style={{ color: accent }}>{progress}%</span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-500 text-sm mt-1"
              >
                ▾
              </motion.span>
            </div>
          </button>

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t border-white/5 pt-4 space-y-4 md:ml-0 ml-11">
                  {/* Tools / Subtopics */}
                  {step.tools && step.tools.length > 0 && step.tools[0] !== "" && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Tools & Topics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {step.tools.map((tool, ti) => (
                          <span
                            key={ti}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{
                              background: `${accent}10`,
                              color: accent,
                              border: `1px solid ${accent}20`,
                            }}
                          >
                            {tool.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource */}
                  {step.resource_title && (
                    <div
                      className="rounded-xl p-4"
                      style={{ background: `${platform.color}08`, border: `1px solid ${platform.color}20` }}
                    >
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Recommended Resource
                      </h4>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{platform.icon}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{step.resource_title}</p>
                            <p className="text-xs mt-0.5" style={{ color: platform.color }}>
                              {step.platform}
                            </p>
                          </div>
                        </div>
                        {step.resource_link && (
                          <a
                            href={step.resource_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 bg-gradient-to-r from-[#00ffc8]/10 to-[#06b6d4]/10 text-[#00ffc8] border border-[#00ffc8]/20 hover:border-[#00ffc8]/50 hover:shadow-lg hover:shadow-[#00ffc8]/10"
                          >
                            Start Learning →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
}
