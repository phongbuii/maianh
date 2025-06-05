'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GlowingHeart = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create DENSE heart - fill entire volume
    const heartGeometry = new THREE.BufferGeometry();
    const particleCount = 50000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Fill heart volume with more particles on edges
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * Math.PI * 2;

      // Heart equations
      const baseX = 16 * Math.pow(Math.sin(t), 3);
      const baseY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

      // Bias towards edges: use power function to concentrate particles on surface
      const radiusBias = Math.pow(Math.random(), 0.3); // Power < 1 pushes values toward 1 (edge)

      // Scale and apply radius
      const scale = 0.4;
      const x = baseX * scale * radiusBias;
      const y = baseY * scale * radiusBias;

      // Add bulge in Z direction - stronger in middle
      const distFromCenter = Math.sqrt(x * x + y * y);
      const maxDist = 6;
      const bulgeAmount = 1 - (distFromCenter / maxDist);
      const zBulge = Math.sqrt(Math.max(0, bulgeAmount)) * 3;

      // Z position with bulge
      const z = (Math.random() - 0.5) * 2 + (Math.random() - 0.5) * zBulge * 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Bright cyan color - slightly dimmer in center
      const centerDim = radiusBias * 0.3 + 0.7;
      const intensity = (0.7 + Math.random() * 0.3) * centerDim;
      colors[i * 3] = intensity * 0.2;     // R
      colors[i * 3 + 1] = intensity * 0.9; // G
      colors[i * 3 + 2] = intensity;       // B
    }

    heartGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Heart material - very small points for density
    const heartMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    const heart = new THREE.Points(heartGeometry, heartMaterial);
    heart.position.y = 1;
    scene.add(heart);

    // Outer glow layer
    const glowGeometry = new THREE.BufferGeometry();
    const glowCount = 10000;
    const glowPositions = new Float32Array(glowCount * 3);

    for (let i = 0; i < glowCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const scale = 0.45 + Math.random() * 0.1;

      const x = 16 * Math.pow(Math.sin(t), 3) * scale;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;

      glowPositions[i * 3] = x + (Math.random() - 0.5) * 3;
      glowPositions[i * 3 + 1] = y + (Math.random() - 0.5) * 3;
      glowPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }

    glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));

    const glowMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x00ddff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.3
    });

    const glowMesh = new THREE.Points(glowGeometry, glowMaterial);
    glowMesh.position.y = 1;
    scene.add(glowMesh);

    // Create heart shadow using tiny bubbles
    const shadowGroup = new THREE.Group();
    const shadowBubbleCount = 5000; // Reduced from 20000 for better performance

    for (let i = 0; i < shadowBubbleCount; i++) {
      // Create heart-shaped shadow distribution
      const t = Math.random() * Math.PI * 2;

      // Heart equations with scale for shadow
      const shadowScale = 0.35;
      const baseX = 16 * Math.pow(Math.sin(t), 3) * shadowScale;
      const baseZ = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shadowScale * 0.8;

      // Very little randomness for dense shadow
      const spread = Math.random() * 0.8;
      const x = baseX + (Math.random() - 0.5) * spread;
      const z = baseZ + (Math.random() - 0.5) * spread;

      // Extremely tiny bubbles - like dust particles
      const bubbleSize = 0.004 + Math.random() * 0.006; // Super tiny: 0.004-0.01
      const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 3, 3); // Minimal segments

      // Dark material with strong opacity for solid shadow look
      const distFromCenter = Math.sqrt(x * x + z * z);
      const maxDist = 8;
      const opacity = Math.max(0.3, 0.8 * (1 - distFromCenter / maxDist));

      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000, // Pure black for shadow
        transparent: true,
        opacity: opacity,
        blending: THREE.MultiplyBlending
      });

      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(x, -7.85, z); // Slightly raised for better visibility

      shadowGroup.add(bubble);
    }

    // Add medium blur layer for gradient
    const mediumBubbleCount = 1000; // Reduced from 3000
    for (let i = 0; i < mediumBubbleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const shadowScale = 0.38 + Math.random() * 0.05;

      const x = 16 * Math.pow(Math.sin(t), 3) * shadowScale + (Math.random() - 0.5) * 1.5;
      const z = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shadowScale * 0.8 + (Math.random() - 0.5) * 1.5;

      const bubbleSize = 0.015 + Math.random() * 0.02;
      const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 3, 3);

      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000011,
        transparent: true,
        opacity: 0.4,
        blending: THREE.MultiplyBlending
      });

      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(x, -7.87, z);

      shadowGroup.add(bubble);
    }

    // Add outer blur bubbles for very soft edge
    const blurBubbleCount = 500; // Reduced from 1500
    for (let i = 0; i < blurBubbleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const shadowScale = 0.45 + Math.random() * 0.1;

      const x = 16 * Math.pow(Math.sin(t), 3) * shadowScale + (Math.random() - 0.5) * 2.5;
      const z = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shadowScale * 0.8 + (Math.random() - 0.5) * 2.5;

      const bubbleSize = 0.03 + Math.random() * 0.04;
      const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 3, 3);

      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000022,
        transparent: true,
        opacity: 0.25,
        blending: THREE.MultiplyBlending
      });

      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(x, -7.9, z);

      shadowGroup.add(bubble);
    }

    scene.add(shadowGroup);

    // Few floating sparkles - water droplets
    const sparkleGroup = new THREE.Group();
    const sparkleCount = 150;

    // Create water droplet-like spheres
    for (let i = 0; i < sparkleCount; i++) {
      // Random size for variety
      const size = 0.15 + Math.random() * 0.25;

      // Create sphere geometry for water droplet
      const dropletGeometry = new THREE.SphereGeometry(size, 32, 32);

      // Alternative simpler material if MeshPhysicalMaterial doesn't work well
      const simpleMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.2,
        blending: THREE.NormalBlending
      });

      const droplet = new THREE.Mesh(dropletGeometry, simpleMaterial);

      // Random position
      droplet.position.x = (Math.random() - 0.5) * 30;
      droplet.position.y = (Math.random() - 0.5) * 25;
      droplet.position.z = (Math.random() - 0.5) * 20;

      // Add inner glow sphere
      const glowGeometry = new THREE.SphereGeometry(size * 0.8, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      droplet.add(glowSphere);

      // Store initial position and random properties for animation
      droplet.userData = {
        initialY: droplet.position.y,
        floatSpeed: 0.3 + Math.random() * 0.7,
        floatAmount: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      };

      sparkleGroup.add(droplet);
    }

    scene.add(sparkleGroup);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Rotate ONLY heart around Y axis - INCREASED SPEED
      heart.rotation.y += 0.02; // Tăng từ 0.01 lên 0.02 (gấp đôi tốc độ)

      // Float up and down
      const float = Math.sin(Date.now() * 0.001) * 0.3;
      heart.position.y = 1 + float;
      glowMesh.position.y = 1 + float;

      // Animate shadow to follow heart rotation
      if (shadowGroup) {
        shadowGroup.rotation.y = heart.rotation.y;
        // Subtle shadow breathing effect
        const shadowScale = 1 + Math.sin(Date.now() * 0.001) * 0.02;
        shadowGroup.scale.x = shadowScale;
        shadowGroup.scale.z = shadowScale;
      }

      // Animate floating bubbles
      const time = Date.now() * 0.001;
      sparkleGroup.children.forEach((droplet, i) => {
        const userData = droplet.userData;
        // Floating motion - slower and smoother
        droplet.position.y = userData.initialY +
          Math.sin(time * userData.floatSpeed + userData.phase) * userData.floatAmount;

        // Very gentle rotation
        droplet.rotation.x += 0.003;
        droplet.rotation.y += 0.005;

        // Subtle scale breathing
        const scalePulse = 1 + Math.sin(time * 1.5 + i) * 0.05;
        droplet.scale.setScalar(scalePulse);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      heartGeometry.dispose();
      heartMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();

      // Dispose bubble geometries and materials
      sparkleGroup.children.forEach(droplet => {
        droplet.geometry.dispose();
        droplet.material.dispose();
        // Dispose inner glow sphere
        if (droplet.children[0]) {
          droplet.children[0].geometry.dispose();
          droplet.children[0].material.dispose();
        }
      });

      // Dispose shadow bubbles
      if (shadowGroup) {
        shadowGroup.children.forEach(bubble => {
          bubble.geometry.dispose();
          bubble.material.dispose();
        });
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#ff3366'
      }}
    />
  );
};

export default GlowingHeart;