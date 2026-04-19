/**
 * UploadResume.js
 * 3D animated drag-and-drop resume upload interface with
 * particle effects and glass morphism design.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "../components/3d/ParticleField";
import FloatingOrbs from "../components/3d/FloatingOrbs";
import { useAuth } from "../context/AuthContext";
import { uploadResumeAuth, uploadResumeLegacy } from "../api";

function UploadResume({ setResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      if (user) {
        // Authenticated upload — saves to DB + extracts skills
        const data = await uploadResumeAuth(file);
        if (data.error) {
          console.error("Upload failed:", data.error);
        } else {
          await refreshProfile();
          // Also do the legacy analysis for career recommendations
          const legacyData = await uploadResumeLegacy(file);
          setResult(legacyData);
          navigate("/results");
        }
      } else {
        // Guest upload — legacy analysis only
        const data = await uploadResumeLegacy(file);
        setResult(data);
        navigate("/results");
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{
            background:
              "radial-gradient(ellipse at center, #0a1520 0%, #05050a 70%)",
          }}
        >
          <ambientLight intensity={0.1} />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#00ffc8" />
          <ParticleField count={500} size={0.015} />
          <FloatingOrbs />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-[2] min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/5 text-[#00ffc8] text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
              AI Resume Scanner
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              <span className="neon-text">Upload</span>
              <span className="text-white"> Your Resume</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Drop your PDF resume and let AI analyze your career potential
            </p>
          </div>

          {/* Upload Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative rounded-3xl bg-[rgba(15,23,42,0.5)] backdrop-blur-2xl border border-[rgba(0,255,200,0.08)] overflow-hidden"
          >
            {/* Animated top border line */}
            <div className="absolute inset-x-0 top-0 h-px">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-[#00ffc8]/40 to-transparent" />
            </div>

            <div className="p-8 sm:p-10">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-500 ${
                  isDragActive || dragActive
                    ? "border-[#00ffc8] bg-[#00ffc8]/5 shadow-[0_0_40px_rgba(0,255,200,0.15)]"
                    : file
                    ? "border-[#00ffc8]/40 bg-[#00ffc8]/5"
                    : "border-slate-700 hover:border-[#00ffc8]/30 hover:bg-white/[0.02]"
                }`}
              >
                <input {...getInputProps()} />

                {/* 3D-style upload icon */}
                <motion.div
                  animate={isDragActive ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-6"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00ffc8]/20 to-[#06b6d4]/20 animate-glow-pulse" />
                    <div className="relative w-full h-full rounded-2xl border border-[#00ffc8]/30 flex items-center justify-center bg-[rgba(0,255,200,0.05)]">
                      <span className="text-3xl">
                        {file ? "📄" : isDragActive ? "⬇️" : "☁️"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-[#00ffc8] font-semibold text-lg mb-1">
                        {file.name}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {(file.size / 1024).toFixed(1)} KB • PDF Document
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="mt-3 text-sm text-red-400/70 hover:text-red-400 underline bg-transparent border-none cursor-pointer"
                      >
                        Remove file
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-file"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-white font-semibold text-lg mb-2">
                        {isDragActive
                          ? "Drop your resume here..."
                          : "Drag & drop your resume"}
                      </p>
                      <p className="text-slate-500 text-sm">
                        or click to browse • PDF files only
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Analyze Button */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: file ? 1 : 0.5 }}
              >
                <button
                  onClick={upload}
                  disabled={!file || loading}
                  className={`btn-cyber w-full py-4 text-base rounded-2xl font-semibold tracking-wide transition-all duration-300 ${
                    !file ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="inline-block w-5 h-5 border-2 border-[#00ffc8] border-t-transparent rounded-full"
                      />
                      Analyzing Resume with AI...
                    </span>
                  ) : (
                    "⚡ Analyze Resume"
                  )}
                </button>
              </motion.div>

              {/* Steps indicator */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { step: "01", label: "Upload PDF" },
                  { step: "02", label: "AI Analyzes" },
                  { step: "03", label: "Get Results" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <span className="text-[#00ffc8] font-mono text-xs font-bold">
                      {s.step}
                    </span>
                    <span className="text-slate-500 text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default UploadResume;
