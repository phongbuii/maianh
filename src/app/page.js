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
    camera.position.z = 35; // Increased from 25
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });
    renderer.setClearColor(0x000000, 1); // Set clear color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create DENSE heart - fill entire volume
    const heartGeometry = new THREE.BufferGeometry();
    const particleCount = 15000; // Increased from 15000 for smoother look
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Fill heart volume with more particles on edges
    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * Math.PI * 2;

      // Heart equations
      const baseX = 16 * Math.pow(Math.sin(t), 3);
      const baseY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

      // Bias towards edges: use power function to concentrate particles on surface
      const radiusBias = Math.pow(Math.random(), 0.4); // Changed from 0.3 to 0.4 for softer edges

      // Scale and apply radius
      const scale = 0.4; // Reverted back to original
      const x = baseX * scale * radiusBias;
      const y = baseY * scale * radiusBias;

      // Add bulge in Z direction - stronger in middle
      const distFromCenter = Math.sqrt(x * x + y * y);
      const maxDist = 6; // Reverted back to original
      const bulgeAmount = 1 - (distFromCenter / maxDist);
      const zBulge = Math.sqrt(Math.max(0, bulgeAmount)) * 3; // Reverted back to original

      // Z position with bulge
      const z = (Math.random() - 0.5) * 2 + (Math.random() - 0.5) * zBulge * 2; // Reverted back to original

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
      size: 0.35, // Increased from 0.29 for softer look
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85, // Decreased from 0.9 for softer appearance
      sizeAttenuation: true
    });

    const heart = new THREE.Points(heartGeometry, heartMaterial);
    heart.position.y = 1;
    scene.add(heart);

    // Create heart shadow using tiny bubbles
    const shadowGroup = new THREE.Group();
    const shadowBubbleCount = 1; // Reduced from 5000 for better performance

    for (let i = 0; i < shadowBubbleCount; i++) {
      // Create heart-shaped shadow distribution
      const t = Math.random() * Math.PI * 2;

      // Heart equations with scale for shadow
      const shadowScale = 0.35; // Reverted back to original
      const baseX = 16 * Math.pow(Math.sin(t), 3) * shadowScale;
      const baseZ = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shadowScale * 0.8;

      // Very little randomness for dense shadow
      const spread = Math.random() * 0.8;
      const x = baseX + (Math.random() - 0.5) * spread;
      const z = baseZ + (Math.random() - 0.5) * spread;

      // Extremely tiny bubbles - like dust particles
      const bubbleSize = 0.01 + Math.random() * 0.015; // Increased from 0.004-0.01
      const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 3, 3); // Minimal segments

      // Dark material with strong opacity for solid shadow look
      const distFromCenter = Math.sqrt(x * x + z * z);
      const maxDist = 8;
      const opacity = Math.max(0.3, 0.8 * (1 - distFromCenter / maxDist));

      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0x001166, // Changed from pure black to dark blue
        transparent: true,
        opacity: opacity * 0.8, // Slightly reduced opacity
        blending: THREE.NormalBlending // Changed from MultiplyBlending
      });

      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(x, -10, z); // Changed from -7.85 to -10

      shadowGroup.add(bubble);
    }

    // Add medium blur layer for gradient
    const mediumBubbleCount = 500; // Reduced from 1000
    for (let i = 0; i < mediumBubbleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const shadowScale = 0.38 + Math.random() * 0.05;

      const x = 16 * Math.pow(Math.sin(t), 3) * shadowScale + (Math.random() - 0.5) * 1.5;
      const z = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shadowScale * 0.8 + (Math.random() - 0.5) * 1.5;

      const bubbleSize = 0.03 + Math.random() * 0.04; // Increased size
      const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 3, 3);

      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0xd00fff, // Dark blue color
        transparent: true,
        opacity: 0.5, // Fixed opacity
        blending: THREE.NormalBlending // Normal blending
      });

      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(x, -10.1, z); // Changed from -7.87 to -10.1

      shadowGroup.add(bubble);
    }

    // Add outer blur bubbles for very soft edge
    const blurBubbleCount = 2000; // Reduced from 500
    for (let i = 0; i < blurBubbleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const shadowScale = 0.45 + Math.random() * 0.1;

      const x = 16 * Math.pow(Math.sin(t), 3) * shadowScale + (Math.random() - 0.5) * 2.5;
      const z = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shadowScale * 0.8 + (Math.random() - 0.5) * 2.5;

      const bubbleSize = 0.05 + Math.random() * 0.06; // Increased size
      const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 3, 3);

      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000033, // Brighter blue for visibility
        transparent: true,
        opacity: 0.3, // Lower opacity
        blending: THREE.NormalBlending // Normal blending
      });

      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(x, -10.2, z); // Changed from -7.9 to -10.2

      shadowGroup.add(bubble);
    }

    scene.add(shadowGroup);

    // Few floating sparkles - water droplets
    const sparkleGroup = new THREE.Group();
    const sparkleCount = 0; // Reduced from 150

    // Create water droplet-like spheres
    for (let i = 0; i < sparkleCount; i++) {
      // Random size for variety
      const size = 0.25 + Math.random() * 0.35; // Increased from 0.15-0.4

      // Create sphere geometry for water droplet
      const dropletGeometry = new THREE.SphereGeometry(size, 32, 32);

      // Alternative simpler material if MeshPhysicalMaterial doesn't work well
      const simpleMaterial = new THREE.MeshBasicMaterial({
        color: 0x000033,
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

    // Create falling text
    const textGroup = new THREE.Group();
    const texts = ['❤️ Mai Anh ❤️', 'I love you', '我爱你', 'Mai Anh'];
    const textMeshes = [];
    const textCount = 60; // Increased from 30 to 60 for dense text rain

    // Create text sprites
    for (let i = 0; i < textCount; i++) {
      const text = texts[i % texts.length]; // Cycle through texts

      // Create canvas for text
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;

      // Style text
      context.font = 'Bold 64px Arial'; // Increased from 48px
      context.fillStyle = '#ff66aa';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Add glow effect
      context.shadowColor = '#ff66aa';
      context.shadowBlur = 20;

      // Draw text
      context.fillText(text, 256, 64);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      // Create sprite material
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      // Create sprite
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(8, 2, 1); // Reduced size slightly from 10, 2.5 to fit more text

      // Random position across the screen - spread even more
      sprite.position.x = (Math.random() - 0.5) * 80; // Increased from 70 to 80
      sprite.position.y = -30 + Math.random() * 70; // Start from -30 to 40 for better distribution
      sprite.position.z = -15 + Math.random() * 30; // Adjusted Z for better visibility

      // Store initial position and speed
      sprite.userData = {
        speed: 0.15 + Math.random() * 0.25, // Increased speed: 0.15-0.4 (was 0.08-0.2)
        initialY: 20 + Math.random() * 10,
        initialX: (Math.random() - 0.5) * 70,
        delay: 0, // No initial delay for immediate falling
        swaySpeed: 1 + Math.random() * 2,
        swayAmount: 0.02 + Math.random() * 0.03
      };

      textMeshes.push(sprite);
      textGroup.add(sprite);
    }

    scene.add(textGroup);

    // Create fire effect for heart
    const fireGroup = new THREE.Group();
    const fireParticleCount = 8000; // Increased from 5000 for more particles

    // Create fire particles
    const fireGeometry = new THREE.BufferGeometry();
    const firePositions = new Float32Array(fireParticleCount * 3);
    const fireColors = new Float32Array(fireParticleCount * 3);
    const fireSizes = new Float32Array(fireParticleCount);

    // Initialize fire particles
    for (let i = 0; i < fireParticleCount; i++) {
      // Start particles around the heart surface
      const t = Math.random() * Math.PI * 2;
      const scale = 0.35 + Math.random() * 0.1;

      const baseX = 16 * Math.pow(Math.sin(t), 3) * scale;
      const baseY = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;

      firePositions[i * 3] = baseX + (Math.random() - 0.5) * 2;
      firePositions[i * 3 + 1] = baseY + (Math.random() - 0.5) * 2;
      firePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;

      // More intense fire colors
      const intensity = 0.8 + Math.random() * 0.2; // Brighter base intensity
      fireColors[i * 3] = intensity;              // Full red
      fireColors[i * 3 + 1] = intensity * 0.15;   // Slight orange tint
      fireColors[i * 3 + 2] = intensity * 0.05;   // Very slight blue for depth

      // Larger particle sizes
      fireSizes[i] = 0.15 + Math.random() * 0.35; // Increased size range
    }

    fireGeometry.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));
    fireGeometry.setAttribute('color', new THREE.BufferAttribute(fireColors, 3));
    fireGeometry.setAttribute('size', new THREE.BufferAttribute(fireSizes, 1));

    // Fire material
    const fireMaterial = new THREE.PointsMaterial({
      size: 0.2,          // Increased base size
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,       // Increased opacity
      sizeAttenuation: true
    });

    const fireParticles = new THREE.Points(fireGeometry, fireMaterial);
    fireParticles.position.y = 1;

    // Store particle data for animation
    fireParticles.userData = {
      originalPositions: firePositions.slice(),
      velocities: new Float32Array(fireParticleCount * 3),
      lifetimes: new Float32Array(fireParticleCount),
      maxLifetimes: new Float32Array(fireParticleCount)
    };

    // Initialize velocities and lifetimes
    for (let i = 0; i < fireParticleCount; i++) {
      fireParticles.userData.velocities[i * 3] = (Math.random() - 0.5) * 0.05; // Increased
      fireParticles.userData.velocities[i * 3 + 1] = 0.1 + Math.random() * 0.2; // Much faster upward
      fireParticles.userData.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // Increased

      fireParticles.userData.lifetimes[i] = Math.random();
      fireParticles.userData.maxLifetimes[i] = 0.5 + Math.random() * 0.5;
    }

    fireGroup.add(fireParticles);
    scene.add(fireGroup);

    // Create ocean effect at bottom
    const oceanGroup = new THREE.Group();



    // Ocean particles for foam/sparkle effect
    const foamCount = 50000; // Increased
    const foamGeometry = new THREE.BufferGeometry();
    const foamPositions = new Float32Array(foamCount * 3);

    for (let i = 0; i < foamCount; i++) {
      foamPositions[i * 3] = (Math.random() - 0.5) * 100;
      foamPositions[i * 3 + 1] = -18 + Math.random() * 3;
      foamPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }

    foamGeometry.setAttribute('position', new THREE.BufferAttribute(foamPositions, 3));

    // Add color variation to foam particles
    const foamColors = new Float32Array(foamCount * 3);
    for (let i = 0; i < foamCount; i++) {
      const intensity = 0.7 + Math.random() * 0.3;
      foamColors[i * 3] = 0;                  // No red
      foamColors[i * 3 + 1] = intensity * 0.8; // Some green for cyan
      foamColors[i * 3 + 2] = intensity;       // Full blue
    }

    foamGeometry.setAttribute('color', new THREE.BufferAttribute(foamColors, 3));

    // Update foam material to use vertex colors
    const foamMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const foam = new THREE.Points(foamGeometry, foamMaterial);
    oceanGroup.add(foam);

    // Add lights for ocean
    const oceanLight = new THREE.DirectionalLight(0x0066ff, 0.7); // Brighter blue light
    oceanLight.position.set(0, 10, 5);
    scene.add(oceanLight);

    scene.add(oceanGroup);

    // Add after scene creation and before heart creation
    const addLogoAndStars = () => {
      // Create logo using texture loader
      const textureLoader = new THREE.TextureLoader();
      const logoTexture = textureLoader.load('/images/maianh.png');

      // Create border geometry (much larger than logo)
      const borderGeometry = new THREE.CircleGeometry(2.5, 32); // Changed from 2.1 to 2.5
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95, // Increased from 0.9 to 0.95 for better visibility
        side: THREE.DoubleSide
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);

      // Create main logo
      const logoGeometry = new THREE.CircleGeometry(2, 32);
      const logoMaterial = new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });

      const logo = new THREE.Mesh(logoGeometry, logoMaterial);

      // Group logo and border
      const logoGroup = new THREE.Group();
      logoGroup.add(border);
      logoGroup.add(logo);

      // Position the entire group
      logoGroup.position.set(15, 30, -10); // Changed X from 20 to 15

      // Add multiple glow lights for softer effect
      const glowColors = [
        { color: 0xffffff, intensity: 0.5, distance: 40 },
        { color: 0xffffff, intensity: 0.3, distance: 50 },
        { color: 0xffffff, intensity: 0.2, distance: 60 }
      ];

      glowColors.forEach(({ color, intensity, distance }) => {
        const glow = new THREE.PointLight(color, intensity, distance);
        glow.position.copy(logoGroup.position);
        scene.add(glow);
      });

      scene.add(logoGroup);

      // Create stars higher up
      const starsGroup = new THREE.Group();
      const starCount = 100;

      for (let i = 0; i < starCount; i++) {
        const starGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 8, 8); // Smaller stars
        const starMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.7 + Math.random() * 0.3
        });

        const star = new THREE.Mesh(starGeometry, starMaterial);

        // Position stars higher
        star.position.x = (Math.random() - 0.5) * 100;
        star.position.y = 15 + Math.random() * 25; // Changed from 10+20 to 15+25
        star.position.z = -20 + Math.random() * 15;

        star.userData = {
          twinkleSpeed: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2
        };

        starsGroup.add(star);
      }

      scene.add(starsGroup);

      return { logoGroup, starsGroup };
    };

    // Create logo and stars
    const { logoGroup, starsGroup } = addLogoAndStars();

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Rotate heart only
      heart.rotation.y += 0.02;

      // Float up and down
      const float = Math.sin(Date.now() * 0.001) * 0.3;
      heart.position.y = 1 + float;

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

      // Animate falling text
      if (textMeshes) {
        textMeshes.forEach((text, index) => {
          const userData = text.userData;

          // Only start falling after delay
          if (time > userData.delay) {
            // Fall down
            text.position.y -= userData.speed;

            // Reset position when text goes off screen or hits ocean
            if (text.position.y < -17) { // Ocean level
              text.position.y = 30 + Math.random() * 20; // Start higher
              text.position.x = (Math.random() - 0.5) * 70; // Wider spread
              text.position.z = (Math.random() - 0.5) * 40;
              userData.speed = 0.15 + Math.random() * 0.25; // New random speed (faster)

              // Create splash effect
              text.material.opacity = 0;
            }

            // Gentle swaying motion
            text.position.x += Math.sin(time * userData.swaySpeed + index) * userData.swayAmount;

            // Fade in/out
            const fadeDistance = 5;
            if (text.position.y > 20) {
              text.material.opacity = Math.max(0, (25 - text.position.y) / fadeDistance);
            } else if (text.position.y < -15) {
              text.material.opacity = Math.max(0, (text.position.y + 20) / fadeDistance);
            } else {
              text.material.opacity = 0.6 + Math.sin(time * 3 + index) * 0.2; // Twinkling effect
            }
          }
        });
      }

      renderer.render(scene, camera);

      // Animate fire particles
      if (fireParticles) {
        const positions = fireGeometry.attributes.position.array;
        const colors = fireGeometry.attributes.color.array;
        const sizes = fireGeometry.attributes.size.array;
        const originalPos = fireParticles.userData.originalPositions;
        const velocities = fireParticles.userData.velocities;
        const lifetimes = fireParticles.userData.lifetimes;
        const maxLifetimes = fireParticles.userData.maxLifetimes;

        for (let i = 0; i < fireParticleCount; i++) {
          // Update lifetime
          lifetimes[i] += 0.02;

          if (lifetimes[i] > maxLifetimes[i]) {
            // Reset particle
            const t = Math.random() * Math.PI * 2;
            const scale = 0.35 + Math.random() * 0.1;

            positions[i * 3] = 16 * Math.pow(Math.sin(t), 3) * scale + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

            velocities[i * 3] = (Math.random() - 0.5) * 0.08;   // More horizontal spread
            velocities[i * 3 + 1] = 0.15 + Math.random() * 0.25; // Faster upward motion
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;

            lifetimes[i] = 0;
            maxLifetimes[i] = 0.3 + Math.random() * 0.4; // Shorter lifetime for faster motion
            sizes[i] = 0.15 + Math.random() * 0.35;
          } else {
            // Update position
            positions[i * 3] += velocities[i * 3];
            positions[i * 3 + 1] += velocities[i * 3 + 1];
            positions[i * 3 + 2] += velocities[i * 3 + 2];

            // Add turbulence
            positions[i * 3] += Math.sin(time * 3 + i) * 0.001;

            // Fade out and shrink
            const lifeRatio = lifetimes[i] / maxLifetimes[i];
            sizes[i] = (0.1 + Math.random() * 0.3) * (1 - lifeRatio * 0.8);

            // Color stays red throughout lifetime
            const intensity = 1 - lifeRatio * 0.5;
            colors[i * 3] = intensity;              // Keep red at full
            colors[i * 3 + 1] = intensity * 0.1;    // Very low green
            colors[i * 3 + 2] = intensity * 0.1;    // Very low blue
          }
        }

        fireGeometry.attributes.position.needsUpdate = true;
        fireGeometry.attributes.color.needsUpdate = true;
        fireGeometry.attributes.size.needsUpdate = true;

        // Rotate fire with heart
        fireParticles.rotation.y = heart.rotation.y;
      }

      // Animate ocean
      if (true) {
        oceanGroup.rotation.y = Math.sin(time * 0.3) * 0.1;
        oceanGroup.rotation.z = Math.cos(time * 0.2) * 0.05;

        // Animate foam particles
        const foamPos = foam.geometry.attributes.position.array;
        for (let i = 0; i < foamPos.length; i += 3) {
          // Floating with waves
          const x = foamPos[i];
          const z = foamPos[i + 2];
          foamPos[i + 1] = -18 + Math.sin(x * 0.05 + time * 2) * 2 +
            Math.cos(z * 0.05 + time * 1.5) * 2 +
            Math.random() * 0.5;

          // Drift
          foamPos[i] += Math.sin(time + i) * 0.02;
          foamPos[i + 2] += Math.cos(time + i) * 0.02;
        }
        foam.geometry.attributes.position.needsUpdate = true;
      }

      // Animate stars twinkling
      if (starsGroup) {
        const time = Date.now() * 0.001;
        starsGroup.children.forEach(star => {
          const twinkle = Math.sin(time * star.userData.twinkleSpeed + star.userData.phase) * 0.3 + 0.7;
          star.material.opacity = twinkle;
          star.scale.setScalar(twinkle);
        });
      }

      // Rotate logo group instead of just logo
      if (logoGroup) {
        logoGroup.rotation.z -= 0.05;
        // Add subtle pulse to border and logo
        const pulse = Math.sin(Date.now() * 0.0005) * 0.1 + 0.9;
        logoGroup.children[0].material.opacity = pulse * 0.8; // Border opacity
        logoGroup.children[1].material.opacity = pulse; // Logo opacity
      }
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

      // Dispose text sprites
      if (textGroup) {
        textGroup.children.forEach(sprite => {
          sprite.material.map.dispose();
          sprite.material.dispose();
        });
      }

      // Dispose fire particles
      if (fireGeometry) {
        fireGeometry.dispose();
        fireMaterial.dispose();
      }

      // Cleanup logo and stars
      if (logoGroup) {
        logoGroup.children.forEach(child => {
          child.geometry.dispose();
          child.material.dispose();
          if (child.material.map) {
            child.material.map.dispose();
          }
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
        background: '#000000'
      }}
    />
  );
};

export default GlowingHeart;