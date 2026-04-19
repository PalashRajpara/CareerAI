/**
 * PageWrapper.js
 * Wraps every page with a consistent layout: 3D background, aurora gradient, page transitions.
 */
import { motion } from 'framer-motion';
import SceneBackground from '../3d/SceneBackground';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function PageWrapper({ children, title, subtitle, sceneIntensity = 'medium', sceneChildren }) {
  return (
    <>
      {/* Fixed 3D background */}
      <SceneBackground intensity={sceneIntensity}>
        {sceneChildren}
      </SceneBackground>

      {/* Page content */}
      <motion.div
        className="page-content min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          {title && (
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 neon-text">{title}</h1>
              {subtitle && (
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">{subtitle}</p>
              )}
              <div className="w-32 h-px mx-auto mt-6 bg-gradient-to-r from-transparent via-[#00ffc8]/40 to-transparent" />
            </motion.div>
          )}

          {/* Page body */}
          {children}
        </div>
      </motion.div>
    </>
  );
}
