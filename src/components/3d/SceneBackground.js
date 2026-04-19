/**
 * SceneBackground.js
 * A complete 3D scene background used across multiple pages.
 * Combines ParticleField, FloatingOrbs, and ambient lighting.
 */
import { Canvas } from '@react-three/fiber';
import ParticleField from './ParticleField';
import FloatingOrbs from './FloatingOrbs';

export default function SceneBackground({ children, intensity = 'medium' }) {
  const particleCount = intensity === 'high' ? 1200 : intensity === 'low' ? 400 : 800;

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient + point lights for glow effects */}
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} intensity={0.3} color="#00ffc8" />
        <pointLight position={[-5, -5, 5]} intensity={0.2} color="#06b6d4" />

        {/* Particle starfield */}
        <ParticleField count={particleCount} />

        {/* Floating glowing orbs */}
        <FloatingOrbs />

        {/* Any additional 3D elements passed as children */}
        {children}
      </Canvas>
    </div>
  );
}
