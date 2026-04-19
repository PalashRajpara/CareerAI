/**
 * About.js
 * Story-based scroll animation page with 3D visuals,
 * timeline sections, and animated feature cards.
 */
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import NeuralNetwork from '../components/3d/NeuralNetwork';
import ParticleField from '../components/3d/ParticleField';
import FloatingOrbs from '../components/3d/FloatingOrbs';
import GlassCard from '../components/ui/GlassCard';

const timeline = [
  {
    step: '01',
    title: 'Upload Your Resume',
    desc: 'Simply upload your PDF resume to our AI engine. We support all standard resume formats.',
    icon: '📄',
    color: '#00ffc8',
  },
  {
    step: '02',
    title: 'AI Skill Extraction',
    desc: 'Our NLP engine scans and extracts technical skills, tools, and competencies from your resume text.',
    icon: '🧠',
    color: '#06b6d4',
  },
  {
    step: '03',
    title: 'Career Matching',
    desc: 'Skills are matched against our job database to find the best career paths with match percentages.',
    icon: '🎯',
    color: '#10b981',
  },
  {
    step: '04',
    title: 'Gap Analysis',
    desc: 'We identify missing skills for each career and provide actionable recommendations.',
    icon: '📊',
    color: '#f59e0b',
  },
];

const techStack = [
  { name: 'React.js', desc: 'Frontend UI Framework', icon: '⚛️' },
  { name: 'Three.js', desc: '3D Graphics Engine', icon: '🔮' },
  { name: 'Flask', desc: 'Python Backend API', icon: '🐍' },
  { name: 'Tailwind CSS', desc: 'Utility-First Styling', icon: '🎨' },
  { name: 'Framer Motion', desc: 'Animation Library', icon: '✨' },
  { name: 'Chart.js', desc: 'Data Visualization', icon: '📈' },
];

const features = [
  'AI-Powered Skill Extraction from PDF Resumes',
  'Intelligent Career Path Matching Algorithm',
  'Comprehensive Skill Gap Analysis',
  'Interactive 3D Data Visualizations',
  'Career Readiness Scoring System',
  'Side-by-Side Career Comparison',
  'Real-time Analytics Dashboard',
  'Personalized Career Profile Builder',
];

function About() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.1} />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#00ffc8" />
          <NeuralNetwork nodeCount={40} spread={10} />
          <ParticleField count={300} size={0.01} spread={20} />
          <FloatingOrbs />
        </Canvas>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#05050a] via-transparent to-[#05050a] pointer-events-none" />

      {/* Content */}
      <div className="relative z-[2] pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/5 text-[#00ffc8] text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
              About the Project
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="text-white">AI Career </span>
              <span className="neon-text">Recommendation</span>
              <br />
              <span className="text-white">System</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
              An intelligent career guidance platform that uses Natural Language Processing
              to analyze resumes, match careers, and provide personalized skill development insights.
            </p>
          </motion.div>

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <GlassCard className="p-8 sm:p-10" glow>
              <h2 className="text-2xl font-bold neon-text mb-4">🔍 Problem Statement</h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                Students and job seekers often struggle to identify the best career paths
                matching their skills. Traditional career guidance is subjective and time-consuming.
                Our AI-driven system automates this process by analyzing resumes, extracting skills,
                and providing data-driven career recommendations — instantly.
              </p>
            </GlassCard>
          </motion.div>

          {/* How It Works — Timeline */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3">
                <span className="text-white">How It </span>
                <span className="neon-text">Works</span>
              </h2>
              <div className="w-20 h-px mx-auto bg-gradient-to-r from-transparent via-[#00ffc8]/40 to-transparent" />
            </motion.div>

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <GlassCard className="p-6 flex items-start gap-6">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                      style={{
                        background: `${item.color}10`,
                        border: `1px solid ${item.color}30`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                          style={{ color: item.color, background: `${item.color}15` }}
                        >
                          STEP {item.step}
                        </span>
                        <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3">
                <span className="text-white">Key </span>
                <span className="neon-text">Features</span>
              </h2>
              <div className="w-20 h-px mx-auto bg-gradient-to-r from-transparent via-[#00ffc8]/40 to-transparent" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(15,23,42,0.3)] border border-white/[0.05] hover:border-[#00ffc8]/15 transition-colors duration-300"
                >
                  <span className="w-2 h-2 rounded-full bg-[#00ffc8] flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3">
                <span className="text-white">Tech </span>
                <span className="neon-text">Stack</span>
              </h2>
              <div className="w-20 h-px mx-auto bg-gradient-to-r from-transparent via-[#00ffc8]/40 to-transparent" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {techStack.map((tech, i) => (
                <GlassCard key={i} delay={0.1 * i} className="p-5 text-center group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tech.icon}</div>
                  <h4 className="text-white font-semibold mb-1">{tech.name}</h4>
                  <p className="text-slate-500 text-xs">{tech.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Footer credits */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-10"
          >
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#00ffc8]/20 to-transparent mb-8" />
            <p className="text-slate-500 text-sm">
              Built with ❤️ using React, Three.js, Flask & AI
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default About;
