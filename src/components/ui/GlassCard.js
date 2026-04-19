/**
 * GlassCard.js
 * Reusable glassmorphism card with hover glow effect and Framer Motion animations.
 */
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', delay = 0, hover = true, glow = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -6, transition: { duration: 0.3 } } : {}}
      className={`
        relative p-6 rounded-2xl
        bg-[rgba(15,23,42,0.5)] backdrop-blur-xl
        border border-[rgba(0,255,200,0.08)]
        transition-all duration-500
        hover:border-[rgba(0,255,200,0.25)]
        hover:shadow-[0_0_30px_rgba(0,255,200,0.1),inset_0_0_30px_rgba(0,255,200,0.05)]
        ${glow ? 'shadow-[0_0_20px_rgba(0,255,200,0.15)]' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay on top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffc8]/20 to-transparent rounded-t-2xl" />
      {children}
    </motion.div>
  );
}
