/**
 * FloatingOrbs.js
 * Renders glowing animated orbs floating in 3D space.
 * Creates an ethereal ambient lighting effect.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

function GlowOrb({ position, color, speed = 1, distort = 0.4, size = 1 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.3;
      ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Sphere ref={ref} args={[size, 32, 32]} position={position}>
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.15}
        distort={distort}
        speed={2}
        roughness={0}
      />
    </Sphere>
  );
}

export default function FloatingOrbs() {
  return (
    <group>
      <GlowOrb position={[-4, 2, -5]} color="#00ffc8" speed={0.8} size={1.5} />
      <GlowOrb position={[4, -1, -3]} color="#06b6d4" speed={1.2} size={1.2} />
      <GlowOrb position={[0, 3, -8]} color="#10b981" speed={0.6} size={2} distort={0.3} />
      <GlowOrb position={[-3, -2, -6]} color="#00ffaa" speed={1} size={0.8} />
      <GlowOrb position={[5, 1, -10]} color="#0ea5e9" speed={0.5} size={1.8} distort={0.5} />
    </group>
  );
}
