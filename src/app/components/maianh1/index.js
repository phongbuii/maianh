'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Effects } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

// Update constants
const NUM_TEXTS = 40; // Reduced from 80
const NUM_HEARTS = 60; // Increased heart count
const SPREAD_FACTOR = 8;
const NUM_SPARKLES = 180;
const NUM_PETALS = 20;

const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getRandomFloat = (min, max) =>
  Math.random() * (max - min) + min;

// Enhanced HeartShape component with blur, shadow and glow effects
const HeartShape = ({ position, scale = 1 }) => {
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x + 0.5, y + 0.5);
  heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
  heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
  heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

  const heartRef = useRef();
  const shadowRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (heartRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 1;
      heartRef.current.scale.set(pulse * scale, pulse * scale, pulse * scale);

      // Animate glow intensity
      if (glowRef.current) {
        const glowPulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
        glowRef.current.material.emissiveIntensity = glowPulse * 1.2;
      }
    }

    // Animate shadow with slight delay for more dynamic effect
    if (shadowRef.current) {
      const shadowPulse = Math.sin(state.clock.elapsedTime * 2 + 0.5) * 0.1 + 0.9;
      shadowRef.current.scale.set(shadowPulse * scale * 1.15, shadowPulse * scale * 1.15, shadowPulse * scale * 1.15);
      shadowRef.current.material.opacity = shadowPulse * 0.6;
    }
  });

  return (
    <group>
      {/* Enhanced Shadow Layer */}
      <mesh
        ref={shadowRef}
        position={[0.15, -0.15, -0.15]}
        rotation={[Math.PI, 0, 0]}
        scale={[1.1, 1.1, 1.1]}
      >
        <shapeGeometry args={[heartShape]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.6}
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* Additional Shadow for more depth */}
      <mesh
        position={[0.08, -0.08, -0.08]}
        rotation={[Math.PI, 0, 0]}
        scale={[1.05, 1.05, 1.05]}
      >
        <shapeGeometry args={[heartShape]} />
        <meshBasicMaterial
          color="#330000"
          transparent
          opacity={0.4}
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* Outer Glow Layer */}
      <mesh
        ref={glowRef}
        rotation={[Math.PI, 0, 0]}
        scale={[1.2, 1.2, 1.2]}
      >
        <shapeGeometry args={[heartShape]} />
        <meshBasicMaterial
          color="#ff4444"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Heart */}
      <mesh
        ref={heartRef}
        rotation={[Math.PI, 0, 0]}
        castShadow
        receiveShadow
      >
        <shapeGeometry args={[heartShape]} />
        <meshPhysicalMaterial
          color="#ff0000"
          emissive="#cc0000"
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.3}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
          blending={THREE.NormalBlending}
          transmission={0.1} // Adds subtle transparency/glass effect
        />
      </mesh>
    </group>
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

const LoveSparkles = () => {
  const sparklesRef = useRef();

  useFrame((state) => {
    sparklesRef.current.children.forEach((sparkle, index) => {
      sparkle.rotation.y += 0.03; // Increased from 0.015
      sparkle.position.y += Math.sin(state.clock.elapsedTime + sparkle.position.x) * 0.025;

      // Add twinkling effect
      const twinkle = Math.sin(state.clock.elapsedTime * 3 + index) * 0.3 + 0.7;
      sparkle.material.emissiveIntensity = twinkle * 2;
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
          scale={[0.02, 0.02, 0.02]}
        >
          <sphereGeometry scale={0.02} args={[1, 8, 8]} />
          <meshPhongMaterial
            color="#F0F0F0"
            emissive="#F0F0F0"
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

  // Animation data cho texts
  const textAnimationData = useRef(
    Array(NUM_TEXTS).fill().map((_, index) => ({
      fallSpeed: 0.35, // Increased from 0.235

      // Even vertical distribution
      initialY: 25 + (index * 2), // More spread out vertically

      // Consistent delays between texts
      startDelay: index * 0.1, // Reduced delay

      // Reduced horizontal movement
      horizontalOffset: 0.002, // Increased movement

      // Minimal rotation
      rotationSpeed: {
        x: 0.0002, // Faster rotation
        y: 0.0002,
        z: 0.0002
      },

      // Rest of the properties remain the same
      maxRotation: {
        x: getRandomFloat(-0.087, 0.087),
        y: getRandomFloat(-0.087, 0.087),
        z: getRandomFloat(-0.087, 0.087)
      },
      currentRotation: { x: 0, y: 0, z: 0 },
      currentTime: 0
    }))
  );

  // Animation data cho hearts
  const heartAnimationData = useRef(
    Array(NUM_HEARTS).fill().map((_, index) => ({
      fallSpeed: getRandomFloat(0.15, 0.25), // Increased from 0.068, 0.102
      initialY: 15 + (index * 1.2),
      startDelay: index * 0.15, // Reduced from 0.3
      horizontalOffset: getRandomFloat(-0.005, 0.005), // More horizontal movement
      rotationSpeed: getRandomFloat(0.04, 0.08), // Faster rotation
      currentTime: 0,
      scale: getRandomFloat(0.25, 0.45), // Different sizes for depth
      initialPosition: {
        x: getRandomFloat(-SPREAD_FACTOR, SPREAD_FACTOR),
        z: getRandomFloat(-SPREAD_FACTOR, SPREAD_FACTOR)
      }
    }))
  );

  useFrame((state, delta) => {
    // Animation cho texts
    texts.forEach((text, index) => {
      const mesh = groupRef.current?.children[index];
      if (mesh) {
        const animData = textAnimationData.current[index];
        animData.currentTime += delta;

        // Chỉ bắt đầu animation sau delay
        if (animData.currentTime > animData.startDelay) {
          // Chuyển động rơi đều đặn
          mesh.position.y -= animData.fallSpeed;

          // Chuyển động ngang nhẹ tạo hiệu ứng tự nhiên
          mesh.position.x += Math.sin(animData.currentTime * 2) * animData.horizontalOffset;

          // Rotation nhẹ - chỉ xoay trong giới hạn 5 độ
          const nextRotX = animData.currentRotation.x + animData.rotationSpeed.x;
          const nextRotY = animData.currentRotation.y + animData.rotationSpeed.y;
          const nextRotZ = animData.currentRotation.z + animData.rotationSpeed.z;

          // Kiểm tra giới hạn và đảo chiều nếu cần
          if (Math.abs(nextRotX) > Math.abs(animData.maxRotation.x)) {
            animData.rotationSpeed.x *= -1;
          } else {
            animData.currentRotation.x = nextRotX;
            mesh.rotation.x = nextRotX;
          }

          if (Math.abs(nextRotY) > Math.abs(animData.maxRotation.y)) {
            animData.rotationSpeed.y *= -1;
          } else {
            animData.currentRotation.y = nextRotY;
            mesh.rotation.y = nextRotY;
          }

          if (Math.abs(nextRotZ) > Math.abs(animData.maxRotation.z)) {
            animData.rotationSpeed.z *= -1;
          } else {
            animData.currentRotation.z = nextRotZ;
            mesh.rotation.z = nextRotZ;
          }

          // Update reset logic in useFrame
          if (mesh.position.y < -12) {
            mesh.position.y = 25; // Fixed height for reset
            mesh.position.x = text.position[0]; // Remove random offset
            mesh.position.z = text.position[2]; // Remove random offset
            animData.currentTime = 0;
            animData.startDelay = 0.2; // Fixed delay for more consistency
          }
        }
      }
    });

    // Enhanced animation cho hearts
    if (heartsRef.current) {
      heartsRef.current.children.forEach((heart, index) => {
        const animData = heartAnimationData.current[index];
        animData.currentTime += delta;

        if (animData.currentTime > animData.startDelay) {
          // Chuyển động rơi đều
          heart.position.y -= animData.fallSpeed;

          // Rotation with slight wobble
          heart.rotation.y += animData.rotationSpeed;
          heart.rotation.z += Math.sin(animData.currentTime * 2) * 0.01;

          // Chuyển động ngang nhẹ với pattern phức tạp hơn
          heart.position.x += Math.sin(animData.currentTime * 1.5) * animData.horizontalOffset;
          heart.position.z += Math.cos(animData.currentTime * 0.8) * animData.horizontalOffset * 0.5;

          // Reset position
          if (heart.position.y < -12) {
            heart.position.y = getRandomFloat(15, 25);
            heart.position.x = animData.initialPosition.x;
            heart.position.z = animData.initialPosition.z;
            animData.currentTime = 0;
            animData.startDelay = getRandomFloat(0, 3);
          }
        }
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
            position={[
              text.position[0],
              textAnimationData.current[index].initialY,
              text.position[2]
            ]}
            fontSize={text.size}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={12} // Reduced from 20
            textAlign="center"
            outlineWidth={0.02} // Reduced from 0.02
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
              heartAnimationData.current[index].initialPosition.x,
              heartAnimationData.current[index].initialY,
              heartAnimationData.current[index].initialPosition.z
            ]}
            scale={[
              heartAnimationData.current[index].scale,
              heartAnimationData.current[index].scale,
              heartAnimationData.current[index].scale
            ]}
          >
            <HeartShape scale={heartAnimationData.current[index].scale} />
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

export default function HomePage() {
  const [texts, setTexts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Initialize as false
  const audioRef = useRef(null);
  const buttonRef = useRef(null);

  // Initialize and play audio
  useEffect(() => {
    audioRef.current = new Audio('/music/nhac.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Attempt to play audio automatically
    // Browsers might block this without user interaction
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // Autoplay started!
        setIsPlaying(true);
      }).catch(error => {
        // Autoplay was prevented.
        console.log("Audio autoplay was prevented:", error);
        setIsPlaying(false);
        // You could show a UI element asking the user to click to play music.
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Runs once on component mount

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Error playing audio on toggle:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update text generation in useEffect
  useEffect(() => {
    const generatedTexts = Array.from({ length: NUM_TEXTS }).map((_, index) => ({
      content: ['I love you', ' 💞Mai Anh 💞', "21-01-2003", "我爱你"][getRandom(0, 4)] || 'Mai Anh',
      position: [
        getRandomFloat(-SPREAD_FACTOR, SPREAD_FACTOR),
        0,
        getRandomFloat(-SPREAD_FACTOR, SPREAD_FACTOR)
      ],
      size: getRandomFloat(0.75, 1), // Reduced from 1, 1.5
    }));
    setTexts(generatedTexts);
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <button
        ref={buttonRef}
        id="toggle-music-button"
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '10px',
          borderRadius: '15px',
          border: 'none',
          alignItems: 'center',
        }}
      >
        <Image
          src="/images/maianh.png"
          width={32}
          height={32}
          alt="Toggle Music"
          style={{
            animation: 'spin 4s linear infinite',
            transition: 'transform 0.3s ease',
            ':hover': {
              transform: 'scale(1.1)'
            },
            top: '20px',
            right: '20px',
          }}
        />
      </button>
      <Canvas
        camera={{
          position: [0, 0, 35],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        shadowMap={{
          enabled: true,
          type: THREE.PCFSoftShadowMap // Softer shadows
        }}
      >
        <color attach="background" args={['#000000']} />
        <fogExp2 attach="fog" args={['#000000', 0.002]} />

        {/* Enhanced Lighting for better shadows */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 15, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0001}
        />
        <pointLight
          position={[10, 10, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <spotLight
          position={[-10, 10, -10]}
          angle={0.5}
          intensity={0.6}
          castShadow
          penumbra={1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Scene texts={texts} />

        {/* Enhanced Post Processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={2.0}
            luminanceThreshold={0.03}
            luminanceSmoothing={0.9}
            height={300}
          />
          <DepthOfField
            focusDistance={0.03}
            focalLength={0.08}
            bokehScale={2}
            height={480}
          />
        </EffectComposer>

        <OrbitControls
          enableZoom={true}
          minDistance={15}
          maxDistance={50}
        />
      </Canvas>
      <QRCodeOverlay />
      <style jsx global>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
    </div>
  );
}