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
    heart.userData.initialRotation = 0; // Track rotation state
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

    // Create glowing base
    const baseGroup = new THREE.Group();

    // Main oval disk
    const diskGeometry = new THREE.CylinderGeometry(7, 7, 0.3, 64);
    const diskMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.5
    });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.scale.set(1.5, 1, 1);
    baseGroup.add(disk);

    // Bright center
    const centerGeometry = new THREE.CylinderGeometry(4, 4, 0.4, 32);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0x66ddff,
      transparent: true,
      opacity: 0.7
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.scale.set(1.5, 1, 1);
    baseGroup.add(center);

    // Edge ring
    const ringGeometry = new THREE.TorusGeometry(7, 0.3, 8, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.scale.set(1.5, 1, 1);
    baseGroup.add(ring);

    baseGroup.position.y = -8;
    scene.add(baseGroup);

    // Few floating sparkles
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 150;
    const sparklePositions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      sparklePositions[i * 3] = (Math.random() - 0.5) * 30;
      sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

    const sparkleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Add continuous rotation for heart and glow
      heart.rotation.y += 0.01; // Keep rotation speed
      glowMesh.rotation.y = heart.rotation.y; // Sync glow rotation with heart

      // Make sure the heart rotation persists
      heart.matrixWorldNeedsUpdate = true;
      glowMesh.matrixWorldNeedsUpdate = true;

      // Float up and down - reduce frequency for smoother motion
      const float = Math.sin(Date.now() * 0.0005) * 0.3;
      heart.position.y = 1 + float;
      glowMesh.position.y = 1 + float;

      // Animate base with slower rotation
      baseGroup.children[2].rotation.z += 0.005;
      const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.03;
      baseGroup.scale.y = pulse;

      // Make sure scene updates
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
      diskGeometry.dispose();
      diskMaterial.dispose();
      centerGeometry.dispose();
      centerMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      sparkleGeometry.dispose();
      sparkleMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#000'
      }}
    />
  );
};

export default GlowingHeart;