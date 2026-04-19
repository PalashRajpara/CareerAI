/**
 * SkillBadge.js
 * A glowing animated skill badge with neon border.
 */
import { motion } from 'framer-motion';

export default function SkillBadge({ skill, index = 0, variant = 'matched' }) {
  const colors = {
    matched: {
      bg: 'rgba(0, 255, 200, 0.1)',
      border: 'rgba(0, 255, 200, 0.3)',
      text: '#00ffc8',
      glow: 'rgba(0, 255, 200, 0.2)',
    },
    missing: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#f87171',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
    neutral: {
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
      text: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.2)',
    },
  };

  const c = colors[variant] || colors.neutral;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.1, boxShadow: `0 0 20px ${c.glow}` }}
      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-default mr-2 mb-2"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ background: c.text, boxShadow: `0 0 6px ${c.glow}` }} />
      {skill}
    </motion.span>
  );
}
