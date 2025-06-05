'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GlowingHeart = () => {
  // Keep the refs at the top
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationSpeedRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const mainGroupRef = useRef(null);
  const autoRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const originalRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const dampingFactor = 0.95; // For smooth rotation decay
  const returnSpeed = 0.02;

  // Define event handlers outside useEffect
  const handleMouseDown = (event) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = {
      x: event.clientX || (event.touches ? event.touches[0].clientX : 0),
      y: event.clientY || (event.touches ? event.touches[0].clientY : 0)
    };
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current) return;

    const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
    const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

    const deltaMove = {
      x: clientX - previousMousePositionRef.current.x,
      y: clientY - previousMousePositionRef.current.y
    };

    // Update rotation speed based on mouse movement
    rotationSpeedRef.current = {
      x: deltaMove.y * 0.008, // Tăng sensitivity
      y: deltaMove.x * 0.008
    };

    previousMousePositionRef.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Add event listeners here
    const mount = mountRef.current;
    mount.addEventListener('mousedown', handleMouseDown);
    mount.addEventListener('touchstart', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Tạo group chính để chứa tất cả elements
    const mainGroup = new THREE.Group();
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

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
    const particleCount = 18000; // Increased from 15000 for smoother look
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

      // Bright white color - slightly dimmer in center
      const centerDim = radiusBias * 0.3 + 0.7;
      const intensity = (0.8 + Math.random() * 0.2) * centerDim; // Tăng intensity cho trắng sáng hơn
      colors[i * 3] = intensity;     // R - Full white
      colors[i * 3 + 1] = intensity; // G - Full white  
      colors[i * 3 + 2] = intensity; // B - Full white
    }

    heartGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Heart material - very small points for density
    const heartMaterial = new THREE.PointsMaterial({
      size: 0.15, // Increased from 0.29 for softer look
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85, // Decreased from 0.9 for softer appearance
      sizeAttenuation: true
    });

    const heart = new THREE.Points(heartGeometry, heartMaterial);
    heart.position.y = 1;
    mainGroup.add(heart); // Add to main group thay vì scene

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
        color: 0xf02233, // Dark blue color
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

    mainGroup.add(shadowGroup); // Add to main group

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

    mainGroup.add(sparkleGroup); // Add to main group

    // Create falling text
    const textGroup = new THREE.Group();
    const texts = ['❤️ Mai Anh ❤️', 'I love you', '我爱你', 'Mai Anh', 'Mãi yêu em'];
    const textMeshes = [];
    const textCount = 200; // Increased from 60 to 200 for more dense text rain

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
      context.fillStyle = '#FF0000';
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

      // Create sprite material with INCREASED opacity
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95, // Increased from 0.8 to 0.95 for better visibility
        blending: THREE.AdditiveBlending
      });

      // Create sprite
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(8, 2, 1); // Reduced size slightly from 10, 2.5 to fit more text

      // Random position across the screen - spread even more
      sprite.position.x = (Math.random() - 0.5) * 100; // Increased spread from 80 to 100
      sprite.position.y = -30 + Math.random() * 100; // Increased height range from 70 to 100
      sprite.position.z = -20 + Math.random() * 40; // Increased depth from 30 to 40

      // Store initial position and speed
      sprite.userData = {
        speed: 0.08 + Math.random() * 0.12, // Giảm từ 0.2-0.5 xuống 0.08-0.2
        initialY: 30 + Math.random() * 20, // Higher starting position
        initialX: (Math.random() - 0.5) * 90,
        delay: Math.random() * 3, // Tăng delay từ 2 lên 3 giây
        swaySpeed: 0.8 + Math.random() * 1.2, // Giảm từ 1.5-4.0 xuống 0.8-2.0
        swayAmount: 0.02 + Math.random() * 0.025 // Giảm từ 0.03-0.07 xuống 0.02-0.045
      };

      textMeshes.push(sprite);
      textGroup.add(sprite);
    }

    mainGroup.add(textGroup); // Add to main group

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
    mainGroup.add(fireGroup); // Add to main group

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
    mainGroup.add(oceanLight); // Add to main group

    // Add after scene creation and before heart creation
    const addLogoAndStars = () => {
      // Create logo using texture loader
      const textureLoader = new THREE.TextureLoader();
      const logoTexture = textureLoader.load('/images/maianh.png');

      // Tạo logo như một sprite thay vì mesh để luôn nhìn về camera
      const logoSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: logoTexture,
        transparent: true,
        opacity: 0.9
      }));
      logoSprite.scale.set(4, 4, 1); // Kích thước logo

      // Tạo border sprite
      const borderCanvas = document.createElement('canvas');
      const borderContext = borderCanvas.getContext('2d');
      borderCanvas.width = 512;
      borderCanvas.height = 512;

      // Vẽ border trắng
      borderContext.beginPath();
      borderContext.arc(256, 256, 250, 0, 2 * Math.PI);
      borderContext.fillStyle = '#ffffff';
      borderContext.fill();

      // Tạo lỗ trong để logo hiển thị
      borderContext.globalCompositeOperation = 'destination-out';
      borderContext.beginPath();
      borderContext.arc(256, 256, 200, 0, 2 * Math.PI);
      borderContext.fill();

      const borderTexture = new THREE.CanvasTexture(borderCanvas);
      const borderSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: borderTexture,
        transparent: true,
        opacity: 0.95
      }));
      borderSprite.scale.set(5, 5, 1); // Lớn hơn logo một chút

      // Group logo và border - KHÔNG add vào mainGroup
      const logoGroup = new THREE.Group();
      logoGroup.add(borderSprite);
      logoGroup.add(logoSprite);

      // Position the entire group - THÊM TRỰC TIẾP VÀO SCENE
      logoGroup.position.set(18, 30, -15);
      scene.add(logoGroup); // Add trực tiếp vào scene, không vào mainGroup

      // Add multiple glow lights for softer effect - cũng add trực tiếp vào scene
      const glowColors = [
        { color: 0xffffff, intensity: 0.5, distance: 40 },
        { color: 0xffffff, intensity: 0.3, distance: 50 },
        { color: 0xffffff, intensity: 0.2, distance: 60 }
      ];

      glowColors.forEach(({ color, intensity, distance }) => {
        const glow = new THREE.PointLight(color, intensity, distance);
        glow.position.copy(logoGroup.position);
        scene.add(glow); // Add trực tiếp vào scene
      });

      // Create stars covering entire screen
      const starsGroup = new THREE.Group();
      const starCount = 800; // Tăng từ 100 lên 800 sao

      for (let i = 0; i < starCount; i++) {
        const starGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.08, 6, 6); // Nhỏ hơn một chút
        const starMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.6 + Math.random() * 0.4
        });

        const star = new THREE.Mesh(starGeometry, starMaterial);

        // Position stars covering entire screen space - phủ khắp không gian 3D
        star.position.x = (Math.random() - 0.5) * 200; // Tăng từ 100 lên 200
        star.position.y = (Math.random() - 0.5) * 150; // Từ 15+25 thành -75 đến +75
        star.position.z = -50 + Math.random() * 100;   // Tăng từ -20+15 thành -50 đến +50

        star.userData = {
          twinkleSpeed: 0.2 + Math.random() * 0.6, // Tốc độ nhấp nháy khác nhau
          phase: Math.random() * Math.PI * 2,
          originalOpacity: 0.6 + Math.random() * 0.4
        };

        starsGroup.add(star);
      }

      // Thêm một layer sao nhỏ hơn ở xa
      for (let i = 0; i < 400; i++) {
        const smallStarGeometry = new THREE.SphereGeometry(0.015 + Math.random() * 0.03, 4, 4);
        const smallStarMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3 + Math.random() * 0.3
        });

        const smallStar = new THREE.Mesh(smallStarGeometry, smallStarMaterial);

        // Sao nhỏ ở xa hơn
        smallStar.position.x = (Math.random() - 0.5) * 300;
        smallStar.position.y = (Math.random() - 0.5) * 200;
        smallStar.position.z = -80 + Math.random() * 160;

        smallStar.userData = {
          twinkleSpeed: 0.1 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2,
          originalOpacity: 0.3 + Math.random() * 0.3
        };

        starsGroup.add(smallStar);
      }

      mainGroup.add(starsGroup); // Stars add vào mainGroup để xoay cùng

      return { logoGroup, starsGroup };
    };

    // Create logo and stars
    const { logoGroup, starsGroup } = addLogoAndStars();

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Get current time
      const time = Date.now() * 0.001;

      // Auto rotation 3D cho toàn bộ scene
      if (!isDraggingRef.current) {
        // Kiểm tra nếu cần quay về vị trí ban đầu
        const needsReturn =
          Math.abs(mainGroup.rotation.x - originalRotationRef.current.x) > 0.01 ||
          Math.abs(mainGroup.rotation.y - originalRotationRef.current.y) > 0.01 ||
          Math.abs(mainGroup.rotation.z - originalRotationRef.current.z) > 0.01;

        if (needsReturn) {
          // Lerp về vị trí ban đầu
          mainGroup.rotation.x += (originalRotationRef.current.x - mainGroup.rotation.x) * returnSpeed;
          mainGroup.rotation.y += (originalRotationRef.current.y - mainGroup.rotation.y) * returnSpeed;
          mainGroup.rotation.z += (originalRotationRef.current.z - mainGroup.rotation.z) * returnSpeed;
        } else {
          // Tự động xoay chậm và mượt khi đã về vị trí ban đầu
          autoRotationRef.current.x += 0.002;
          autoRotationRef.current.y += 0.003;
          autoRotationRef.current.z += 0.001;

          // Apply auto rotation to main group
          mainGroup.rotation.x = Math.sin(autoRotationRef.current.x) * 0.1;
          mainGroup.rotation.y = autoRotationRef.current.y;
          mainGroup.rotation.z = Math.sin(autoRotationRef.current.z) * 0.05;

          // Cập nhật original rotation để theo dõi auto rotation
          originalRotationRef.current.x = mainGroup.rotation.x;
          originalRotationRef.current.y = mainGroup.rotation.y;
          originalRotationRef.current.z = mainGroup.rotation.z;
        }
      }

      if (isDraggingRef.current) {
        // Update rotation for entire main group when dragging
        mainGroup.rotation.x += rotationSpeedRef.current.x;
        mainGroup.rotation.y += rotationSpeedRef.current.y;

        // Apply damping to rotation speed
        rotationSpeedRef.current.x *= dampingFactor;
        rotationSpeedRef.current.y *= dampingFactor;
      }

      // Heart-specific animations
      const heartFloat = Math.sin(Date.now() * 0.001) * 0.3;
      heart.position.y = 1 + heartFloat;

      // Heart rotation (independent of main group rotation)
      heart.rotation.y += 0.02;

      // Animate shadow to follow heart rotation
      if (shadowGroup) {
        shadowGroup.rotation.y = heart.rotation.y;
        // Subtle shadow breathing effect
        const shadowScale = 1 + Math.sin(Date.now() * 0.001) * 0.02;
        shadowGroup.scale.x = shadowScale;
        shadowGroup.scale.z = shadowScale;
      }

      // Animate floating bubbles
      const times = Date.now() * 0.001;
      sparkleGroup.children.forEach((droplet, i) => {
        const userData = droplet.userData;
        // Floating motion - slower and smoother
        droplet.position.y = userData.initialY +
          Math.sin(times * userData.floatSpeed + userData.phase) * userData.floatAmount;

        // Very gentle rotation
        droplet.rotation.x += 0.003;
        droplet.rotation.y += 0.005;

        // Subtle scale breathing
        const scalePulse = 1 + Math.sin(times * 1.5 + i) * 0.05;
        droplet.scale.setScalar(scalePulse);
      });

      // Animate falling text with INCREASED opacity throughout
      if (textMeshes) {
        textMeshes.forEach((text, index) => {
          const userData = text.userData;

          // Only start falling after delay
          if (times > userData.delay) {
            // Fall down
            text.position.y -= userData.speed;

            // Reset position when text goes off screen or hits ocean
            if (text.position.y < -17) { // Ocean level
              text.position.y = 30 + Math.random() * 20; // Start higher
              text.position.x = (Math.random() - 0.5) * 70; // Wider spread
              text.position.z = (Math.random() - 0.5) * 40;
              userData.speed = 0.08 + Math.random() * 0.12; // Giảm tốc độ reset (chậm hơn)

              // Create splash effect
              text.material.opacity = 0;
            }

            // Gentle swaying motion
            text.position.x += Math.sin(times * userData.swaySpeed + index) * userData.swayAmount;

            // Enhanced fade in/out with higher minimum opacity
            const fadeDistance = 5;
            if (text.position.y > 20) {
              text.material.opacity = Math.max(0.5, (25 - text.position.y) / fadeDistance * 0.95); // Increased minimum opacity
            } else if (text.position.y < -15) {
              text.material.opacity = Math.max(0.3, (text.position.y + 20) / fadeDistance * 0.95); // Increased minimum opacity
            } else {
              text.material.opacity = 0.8 + Math.sin(times * 3 + index) * 0.15; // Increased base opacity to 0.8
            }
          }
        });
      }

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

      // Animate stars twinkling
      if (starsGroup) {
        const time = Date.now() * 0.001;
        starsGroup.children.forEach(star => {
          const twinkle = Math.sin(time * star.userData.twinkleSpeed + star.userData.phase) * 0.3 + 0.7;
          star.material.opacity = twinkle;
          star.scale.setScalar(twinkle);
        });
      }

      // Logo animation - CỐ ĐỊNH VỊ TRÍ và LUÔN NHÌN VỀ CAMERA
      if (logoGroup) {
        // Logo sprites tự động nhìn về camera nên không cần xoay
        // Chỉ cần animation xoay Z và pulse effect
        const logoSprite = logoGroup.children[1]; // Logo sprite
        const borderSprite = logoGroup.children[0]; // Border sprite

        if (logoSprite && borderSprite) {
          logoSprite.material.rotation -= 0.05; // Xoay texture thay vì object

          // Add subtle pulse effect
          const pulse = Math.sin(Date.now() * 0.0005) * 0.1 + 0.9;
          borderSprite.material.opacity = pulse * 0.8;
          logoSprite.material.opacity = pulse;

          // Đảm bảo vị trí cố định
          logoGroup.position.set(18, 30, -15);
        }
      }

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
      mount.removeEventListener('mousedown', handleMouseDown);
      mount.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);

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
  }, []); // Empty dependency array

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#000000',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none' // Prevent default touch actions
      }}
    />
  );
};

export default GlowingHeart;