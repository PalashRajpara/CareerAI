/**
 * NeuralNetwork.js
 * Interactive 3D neural network visualization.
 * Shows connected nodes with animated data flow — the centerpiece 3D element.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function NetworkNode({ position, color = '#00ffc8', size = 0.08 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.3);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function NetworkConnections({ nodes }) {
  const linesRef = useRef();

  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i][0] - nodes[j][0], 2) +
          Math.pow(nodes[i][1] - nodes[j][1], 2) +
          Math.pow(nodes[i][2] - nodes[j][2], 2)
        );
        if (dist < 3) {
          conns.push([nodes[i], nodes[j]]);
        }
      }
    }
    return conns;
  }, [nodes]);

  const linePositions = useMemo(() => {
    const positions = [];
    connections.forEach(([a, b]) => {
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    });
    return new Float32Array(positions);
  }, [connections]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={linesRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffc8" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

export default function NeuralNetwork({ nodeCount = 60, spread = 6 }) {
  const groupRef = useRef();

  const nodes = useMemo(() => {
    const n = [];
    // Create layers resembling a neural network
    const layers = 5;
    const nodesPerLayer = Math.ceil(nodeCount / layers);
    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < nodesPerLayer; i++) {
        const x = (layer - layers / 2) * (spread / layers) + (Math.random() - 0.5) * 0.5;
        const y = (Math.random() - 0.5) * spread * 0.6;
        const z = (Math.random() - 0.5) * 2;
        n.push([x, y, z]);
      }
    }
    return n;
  }, [nodeCount, spread]);

  const colors = ['#00ffc8', '#06b6d4', '#10b981', '#00ffaa', '#0ea5e9'];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <NetworkConnections nodes={nodes} />
      {nodes.map((pos, i) => (
        <NetworkNode
          key={i}
          position={pos}
          color={colors[i % colors.length]}
          size={0.04 + Math.random() * 0.06}
        />
      ))}
    </group>
  );
}
