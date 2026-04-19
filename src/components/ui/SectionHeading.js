/**
 * SectionHeading.js
 * Reusable section heading with neon gradient text and decorative line.
 */
import { motion } from 'framer-motion';

export default function SectionHeading({ title, subtitle, className = '' }) {
  return (
    <motion.div
      className={`mb-8 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold neon-text mb-2">{title}</h2>
      {subtitle && <p className="text-slate-400">{subtitle}</p>}
      <div className="w-20 h-px mt-3 bg-gradient-to-r from-[#00ffc8]/60 to-transparent" />
    </motion.div>
  );
}
