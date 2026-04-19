/**
 * AnimatedCounter.js
 * Animated number counter that counts up to a target value with easing.
 */
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 2000, suffix = '', prefix = '', className = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseFloat(value);
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration, isInView]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {prefix}{Math.round(count * 100) / 100}{suffix}
    </motion.span>
  );
}
