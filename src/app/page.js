'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Effects } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { QRCodeSVG } from 'qrcode.react';
import Home from './components/Home';
import HomePage from './components/maianh1';
import HeartRain from './components/maianh2';

const NUM_TEXTS = 80; // Reduced from 100
const NUM_HEARTS = 20; // Reduced from 30
const SPREAD_FACTOR = 8; // Reduced from 12
const NUM_SPARKLES = 80; // Reduced from 120
const NUM_PETALS = 20; // Reduced from 30

const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const HeartShape = () => {
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x + 0.5, y + 0.5);
  heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
  heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
  heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

  return (
    <mesh rotation={[Math.PI, 0, 0]}>
      <shapeGeometry args={[heartShape]} />
      <meshPhongMaterial
        color="red"
        side={THREE.DoubleSide}
        emissive="#ff0000"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const StarField = () => {
  const count = 2000;
  const [positions] = useState(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Faster sparkle animation
const LoveSparkles = () => {
  const sparklesRef = useRef();

  useFrame((state) => {
    sparklesRef.current.children.forEach((sparkle) => {
      sparkle.rotation.y += 0.015; // Increased from 0.01
      sparkle.position.y += Math.sin(state.clock.elapsedTime + sparkle.position.x) * 0.015; // Increased from 0.01
    });
  });

  return (
    <group ref={sparklesRef}>
      {Array.from({ length: NUM_SPARKLES }).map((_, i) => (
        <mesh
          key={i}
          position={[
            getRandom(-SPREAD_FACTOR, SPREAD_FACTOR),
            getRandom(-SPREAD_FACTOR, SPREAD_FACTOR),
            getRandom(-SPREAD_FACTOR, SPREAD_FACTOR)
          ]}
          scale={[0.1, 0.1, 0.1]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshPhongMaterial
            color="#ff69b4"
            emissive="#ff1493"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

const Scene = ({ texts }) => {
  const groupRef = useRef();
  const heartsRef = useRef();
  const textRotations = useRef(
    Array(NUM_TEXTS).fill().map(() => ({
      x: Math.random() * 0.003 - 0.0015, // Increased from 0.002
      y: Math.random() * 0.003 - 0.0015, // Increased from 0.002
      z: Math.random() * 0.003 - 0.0015  // Increased from 0.002
    }))
  );

  useFrame((state) => {
    // Faster auto-rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002; // Increased from 0.001
    }

    // Faster text animation
    texts.forEach((text, index) => {
      const mesh = groupRef.current?.children[index];
      if (mesh) {
        // Add self-rotation
        mesh.rotation.x += textRotations.current[index].x;
        mesh.rotation.y += textRotations.current[index].y;
        mesh.rotation.z += textRotations.current[index].z;

        // Existing position animation
        mesh.position.y -= 0.03; // Increased from 0.02
        if (mesh.position.y < -10) mesh.position.y = 10;
      }
    });

    // Faster heart animation
    if (heartsRef.current) {
      heartsRef.current.children.forEach((heart) => {
        heart.rotation.y += 0.03; // Increased from 0.02
        heart.position.y -= 0.03; // Increased from 0.02
        if (heart.position.y < -10) heart.position.y = 10;
      });
    }
  });

  return (
    <>
      <LoveSparkles />
      <group ref={groupRef}>
        {texts.map((text, index) => (
          <Text
            key={`text-${index}`}
            position={text.position}
            fontSize={text.size}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            textAlign="center"
            outlineWidth={0.02}
            outlineColor="#000000"
            castShadow
            receiveShadow
          >
            {text.content}
          </Text>
        ))}
      </group>
      <group ref={heartsRef}>
        {Array.from({ length: NUM_HEARTS }).map((_, index) => (
          <group
            key={`heart-${index}`}
            position={[
              getRandom(-SPREAD_FACTOR, SPREAD_FACTOR),
              getRandom(5, 25),
              getRandom(-SPREAD_FACTOR, SPREAD_FACTOR)
            ]}
            scale={[0.2, 0.2, 0.2]} // Reduced from 0.3
          >
            <HeartShape />
          </group>
        ))}
      </group>
    </>
  );
};

const QRCodeOverlay = () => {
  const [showQR, setShowQR] = useState(false);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <button
        onClick={() => setShowQR(!showQR)}
        style={{
          padding: '10px',
          borderRadius: '5px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {showQR ? 'Hide QR' : 'Show QR'}
      </button>

      {showQR && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          right: '0',
          background: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          <QRCodeSVG value={pageUrl} size={128} />
        </div>
      )}
    </div>
  );
};

export default function Page() {
  const [texts, setTexts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const generatedTexts = Array.from({ length: NUM_TEXTS }).map(() => ({
      content: ['I love you', 'Mai Anh', '21-01-2003', '我爱你'][getRandom(0, 4)] || 'Mai Anh',
      position: [
        getRandom(-SPREAD_FACTOR, SPREAD_FACTOR), // wider X spread
        getRandom(5, 25), // higher Y spread
        getRandom(-SPREAD_FACTOR, SPREAD_FACTOR) // deeper Z spread
      ],
      size: getRandom(0.8, 1.2), // Increased text size
    }));
    setTexts(generatedTexts);
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <HomePage />
      {/* <HeartRain /> */}
    </div>

  );
}