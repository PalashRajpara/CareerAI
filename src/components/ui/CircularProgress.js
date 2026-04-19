/**
 * CircularProgress.js
 * Animated circular progress ring with glowing neon effect.
 */
import { motion } from 'framer-motion';

export default function CircularProgress({ value, size = 140, strokeWidth = 8, label = '', className = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Determine color based on value
  const getColor = (val) => {
    if (val >= 75) return '#00ffc8';
    if (val >= 50) return '#06b6d4';
    if (val >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(value);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      {/* Center value display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{Math.round(value)}%</span>
        {label && <span className="text-xs text-slate-400 mt-1">{label}</span>}
      </div>
    </div>
  );
}
