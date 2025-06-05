// components/HeartParticles.js
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

function generateHeartShape(count = 1000) {
  const positions = [];

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = 1 - Math.sin(t);

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    positions.push(x * 0.05, y * 0.05, (Math.random() - 0.5) * 0.5); // scale nhỏ lại và random Z
  }

  return new Float32Array(positions);
}

const HeartParticles = () => {
  const pointsRef = useRef();
  const particles = useMemo(() => generateHeartShape(2000), []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ height: "100vh", background: "black" }}>
      <Points ref={pointsRef} positions={particles}>
        <PointMaterial
          transparent
          color="#00ffff"
          size={0.05}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </Canvas>
  );
};

export default HeartParticles;
