/**
 * Home.js
 * Immersive landing page with full-screen 3D neural network hero,
 * animated text, floating feature cards, and call-to-action.
 */
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import NeuralNetwork from '../components/3d/NeuralNetwork';
import ParticleField from '../components/3d/ParticleField';
import FloatingOrbs from '../components/3d/FloatingOrbs';
import GlassCard from '../components/ui/GlassCard';

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Analysis',
    desc: 'Advanced NLP extracts and analyzes skills from your resume with precision.',
  },
  {
    icon: '🎯',
    title: 'Career Matching',
    desc: 'Intelligent algorithms match your profile to the best career paths.',
  },
  {
    icon: '📊',
    title: 'Skill Insights',
    desc: 'Detailed skill gap analysis with visual strength assessment.',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Get comprehensive career recommendations in seconds.',
  },
];

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== Full-screen 3D Hero Background ===== */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'radial-gradient(ellipse at center, #0a1a1a 0%, #05050a 70%)' }}
        >
          <ambientLight intensity={0.15} />
          <pointLight position={[10, 10, 10]} intensity={0.4} color="#00ffc8" />
          <pointLight position={[-10, -5, 5]} intensity={0.3} color="#06b6d4" />
          <pointLight position={[0, -10, -5]} intensity={0.2} color="#10b981" />

          {/* Interactive Neural Network — the centerpiece */}
          <NeuralNetwork nodeCount={80} spread={8} />
          <ParticleField count={600} size={0.015} spread={25} />
          <FloatingOrbs />

          {/* Allow orbit controls for interactivity */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>

      {/* ===== Aurora overlay gradient ===== */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-[#05050a]/30 to-[#05050a] pointer-events-none" />

      {/* ===== Hero Content ===== */}
      <div className="relative z-[2] min-h-screen flex flex-col items-center justify-center px-4 text-center pt-20">
        {/* Subtitle badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/5 text-[#00ffc8] text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
          AI-Powered Career Intelligence
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 max-w-4xl"
        >
          <span className="text-white">Discover Your </span>
          <span className="neon-text">Perfect Career</span>
          <span className="text-white"> Path</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed"
        >
          Upload your resume and let our AI engine analyze your skills, match careers,
          and generate a personalized learning roadmap — all in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to="/upload" className="no-underline">
            <button className="btn-cyber px-8 py-4 text-base rounded-2xl flex items-center gap-2 group">
              <span>Get Started</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </button>
          </Link>
          <Link to="/about" className="no-underline">
            <button className="px-8 py-4 rounded-2xl text-slate-300 border border-slate-700 hover:border-[#00ffc8]/30 hover:text-white transition-all duration-300 bg-transparent font-semibold text-base cursor-pointer">
              Learn More
            </button>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-[#00ffc8]/30 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-[#00ffc8]" />
          </motion.div>
        </motion.div>
      </div>

      {/* ===== Features Section ===== */}
      <div className="relative z-[2] pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-white">How It </span>
              <span className="neon-text">Works</span>
            </h2>
            <div className="w-20 h-px mx-auto bg-gradient-to-r from-transparent via-[#00ffc8]/40 to-transparent" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={i} delay={0.1 * i} className="text-center group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Stats Section ===== */}
      <div className="relative z-[2] pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '15+', label: 'Skills Tracked' },
              { value: '10+', label: 'Career Paths' },
              { value: '3', label: 'Top Matches' },
              { value: '< 5s', label: 'Analysis Time' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center py-6"
              >
                <div className="text-3xl font-bold neon-text mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
