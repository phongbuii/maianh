import React, { useEffect, useRef } from 'react';

class Particle {
  constructor(x, y, referencePoint) {
    this.x = x;
    this.y = y;
    this.referencePoint = referencePoint; // Store reference point
    this.size = Math.random() * 5 + 2; // Increased size range
    this.speedX = Math.random() * 4 - 2; // Increased speed range
    this.speedY = Math.random() * 4 - 2;
    this.life = 1;
    this.decay = Math.random() * 0.008 + 0.005; // Slower decay
  }

  update() {
    this.x += this.speedX * 0.2;
    this.y += this.speedY * 0.2;
    this.life -= this.decay;
    
    // Reset particle if it dies
    if (this.life <= 0) {
      this.life = 1;
      // Use stored reference point instead of undefined point
      this.x = this.referencePoint.x + (Math.random() - 0.5) * 20;
      this.y = this.referencePoint.y + (Math.random() - 0.5) * 20;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 102, ${this.life})`;
    ctx.fill();
    
    // Add glow effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 3 // Increased glow radius
    );
    gradient.addColorStop(0, `rgba(255, 0, 102, ${this.life * 0.7})`); // Increased opacity
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Add heart emojis array
const HEART_EMOJIS = ['❤️', '💖', '💝', '💗', '💓', '💕'];

// Update FallingText class to include heart decorations
class FallingText {
  constructor(text, x, startY, speed, color) {
    this.text = text;
    this.x = x;
    this.y = startY;
    this.speed = speed * 2;
    this.color = color;
    this.opacity = 1;
    this.scale = Math.random() * 0.4 + 0.9; // Smaller scale for better look
    // Add small hearts around text
    this.hearts = Array(2).fill().map(() => ({
      offsetX: (Math.random() - 0.5) * 40,
      offsetY: (Math.random() - 0.5) * 20,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      scale: Math.random() * 0.3 + 0.2 // Very small hearts
    }));
  }

  draw(ctx) {
    ctx.save();
    
    // Draw main text
    ctx.font = `bold ${14 * this.scale}px Arial, "Microsoft YaHei", "微软雅黑"`;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.textAlign = 'center';
    
    // Enhanced shadow for text
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(this.text, this.x, this.y);

    // Draw decorative hearts
    this.hearts.forEach(heart => {
      ctx.font = `${12 * heart.scale}px Arial`;
      ctx.shadowColor = 'rgba(255, 192, 203, 0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(
        heart.emoji,
        this.x + heart.offsetX,
        this.y + heart.offsetY
      );
    });

    ctx.restore();
  }

  update(canvasHeight) {
    this.y += this.speed;
    if (this.y > canvasHeight) {
      this.y = -50 - Math.random() * 50;
      this.x += (Math.random() - 0.5) * 30;
      // Regenerate heart positions when text resets
      this.hearts.forEach(heart => {
        heart.offsetX = (Math.random() - 0.5) * 40;
        heart.offsetY = (Math.random() - 0.5) * 20;
        heart.emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      });
    }
  }
}

// Add standalone falling hearts
class FallingHeart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = Math.random() * 2 + 1;
    this.emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
    this.scale = Math.random() * 0.3 + 0.2;
    this.drift = Math.sin(Math.random() * Math.PI * 2) * 0.5;
  }

  update(canvasHeight) {
    this.y += this.speed;
    this.x += this.drift;
    if (this.y > canvasHeight) {
      this.y = -50;
      this.x = Math.random() * window.innerWidth;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.font = `${12 * this.scale}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 192, 203, 0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.restore();
  }
}

// Add device detection helper at the top of the file
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Update the GlowingHeartAnimation component
const GlowingHeartAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const platformBubblesRef = useRef([]);
  const rotationRef = useRef(0); // Thêm ref để theo dõi góc xoay
  const imageRef = useRef(null); // Thêm ref cho hình ảnh
  const leftTextsRef = useRef([]);
  const rightTextsRef = useRef([]);
  const fallingHeartsRef = useRef([]); // Thêm ref cho trái tim rơi

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Load image
    const heartImage = new Image();
    heartImage.src = 'images/maianh.png'; // Đảm bảo hình ảnh nằm trong thư mục công cộng
    imageRef.current = heartImage;

    // Responsive scaling factors
    const getScalingFactors = () => {
      const isMobileDevice = isMobile();
      return {
        heartScale: isMobileDevice ? 0.004 : 0.002, // Larger heart on mobile
        imageScale: isMobileDevice ? 0.25 : 0.18, // Larger image on mobile
        platformScale: isMobileDevice ? 0.4 : 0.3, // Larger platform on mobile
        textScale: isMobileDevice ? 1.5 : 1, // Larger text on mobile
        particleDensity: isMobileDevice ? 0.6 : 1 // Reduce particles on mobile
      };
    };

    const scales = getScalingFactors();

    // Set canvas size to window size
    const updateCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = window.innerWidth * pixelRatio;
      const height = window.innerHeight * pixelRatio;
      
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      ctx.scale(pixelRatio, pixelRatio);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Điều chỉnh vị trí trung tâm
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Điều chỉnh kích thước trái tim - giảm scale
    const HEART_SCALE = Math.min(canvas.width, canvas.height) * scales.heartScale;

    // Cập nhật hàm createHeartShape
    const createHeartShape = (t) => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { 
        x: x * HEART_SCALE * 8 + centerX, 
        y: y * HEART_SCALE * 8 + centerY * 0.8 // Điều chỉnh từ 0.5 lên 0.8 để đưa trái tim xuống
      };
    };

    // Generate heart particles
    const generateHeartParticles = () => {
      const particles = [];
      const stepSize = isMobile() ? 0.04 : 0.02; // Fewer points on mobile
      for (let t = 0; t < Math.PI * 2; t += stepSize) {
        const point = createHeartShape(t);
        const particleCount = Math.floor(8 * scales.particleDensity);
        for (let i = 0; i < particleCount; i++) { // Changed from 5 to 8 particles per point
          const offsetX = (Math.random() - 0.5) * 40; // Increased spread from 30 to 40
          const offsetY = (Math.random() - 0.5) * 40;
          particles.push(new Particle(point.x + offsetX, point.y + offsetY, point));
        }
      }
      return particles;
    };

    // Platform particles
    const generatePlatformParticles = () => {
      const particles = [];
      const platformY = centerY * 1.6; // Điều chỉnh từ 1.1 lên 1.4
      const platformWidth = centerX * 0.6;
      
      for (let i = 0; i < 50; i++) {
        const referencePoint = {
          x: centerX + (Math.random() - 0.5) * platformWidth,
          y: platformY + (Math.random() - 0.5) * 10
        };
        // Pass referencePoint to Particle constructor
        particles.push(new Particle(
          referencePoint.x, 
          referencePoint.y, 
          referencePoint
        ));
      }
      return particles;
    };

    // Create bubble
    const createBubble = () => {
      return {
        x: centerX + (Math.random() - 0.5) * centerX * 0.8,
        y: centerY * 1.6, // Điều chỉnh từ 1.1 lên 1.4 để khớp với platform
        size: Math.random() * (centerY * 0.015) + centerY * 0.005, // Điều chỉnh kích thước
        speed: Math.random() * 1.5 + 0.8, // Điều chỉnh tốc độ
        opacity: Math.random() * 0.4 + 0.6 // Điều chỉnh độ trong suốt
      };
    };

    let time = 0;
    let heartParticles = generateHeartParticles();
    let platformParticles = generatePlatformParticles();
    platformBubblesRef.current = Array(50).fill().map(() => createBubble()); // Tăng từ 30 lên 50

    // Thêm hàm vẽ trái tim với góc xoay
    const drawRotatedHeart = (ctx, time) => {
      // Draw heart particles first
      ctx.save();
      ctx.translate(centerX, centerY * 0.7);
      const scaleX = Math.cos(rotationRef.current);
      ctx.scale(scaleX * 1.2, 1.2);
      ctx.translate(-centerX, -centerY * 0.7);

      // Draw first layer of heart particles
      heartParticles.slice(0, Math.floor(heartParticles.length / 2)).forEach(particle => {
        particle.draw(ctx);
      });

      ctx.restore();

      // Draw image in middle (between particle layers)
      if (imageRef.current.complete) {
        ctx.save();
        const imgSize = centerY * scales.imageScale; // Reduced size more for better fit
        const imgX = centerX - imgSize / 2;
        const imgY = centerY * 0.95; // Moved down further from 0.85 to 0.95

        // Add white border glow before clipping
        ctx.beginPath();
        ctx.arc(centerX, imgY, imgSize / 2 + 2, 0, Math.PI * 2); // Slightly larger circle for border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Add outer glow for border
        ctx.beginPath();
        ctx.arc(centerX, imgY, imgSize / 2 + 3, 0, Math.PI * 2);
        const borderGlow = ctx.createRadialGradient(
          centerX, imgY, imgSize / 2,
          centerX, imgY, imgSize / 2 + 6
        );
        borderGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        borderGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = borderGlow;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Create clipping path for image
        ctx.beginPath();
        ctx.arc(centerX, imgY, imgSize / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw image
        ctx.drawImage(
          imageRef.current,
          imgX,
          imgY - imgSize / 2,
          imgSize,
          imgSize
        );

        // Add inner glow
        const imageGlow = ctx.createRadialGradient(
          centerX,
          imgY,
          imgSize / 2 * 0.4,
          centerX,
          imgY,
          imgSize / 2 * 1.5
        );
        imageGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
        imageGlow.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

        ctx.fillStyle = imageGlow;
        ctx.fill();

        ctx.restore();

        // Update text position to match new image position
        ctx.save();
        ctx.font = `${imgSize * 0.25}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Slightly more transparent
        
        // Even softer text glow
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 10;
        
        const textY = imgY + imgSize / 2 + 8; // Slightly more spacing
        ctx.fillText('❤️❤️ Mai Anh ❤️❤️', centerX, textY);
        ctx.restore();
      }

      // Draw second layer of heart particles
      ctx.save();
      ctx.translate(centerX, centerY * 0.7);
      ctx.scale(scaleX * 1.2, 1.2);
      ctx.translate(-centerX, -centerY * 0.7);

      // Draw remaining heart particles on top
      heartParticles.slice(Math.floor(heartParticles.length / 2)).forEach(particle => {
        particle.draw(ctx);
      });

      ctx.restore();
    };

    // Cập nhật drawRotatedPlatform
    const drawRotatedPlatform = (ctx) => {
      ctx.save();
      // Move platform position lower
      ctx.translate(centerX, centerY * 1.6);
      const scaleX = Math.cos(-rotationRef.current * 0.5);
      ctx.scale(scaleX * 1.2, 1.2);
      ctx.translate(-centerX, -centerY * 1.6);

      // Update gradient position
      const platformGradient = ctx.createRadialGradient(
        centerX, centerY * 1.6, 0,
        centerX, centerY * 1.6, centerY * 0.4
      );
      platformGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
      platformGradient.addColorStop(0.7, 'rgba(0, 153, 255, 0.4)');
      platformGradient.addColorStop(1, 'transparent');
      
      // Update platform ellipse positions
      ctx.beginPath();
      ctx.ellipse(
        centerX, 
        centerY * 1.6, 
        centerX * scales.platformScale, 
        centerY * 0.05, 
        0, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = platformGradient;
      ctx.fill();
      
      // Platform core
      ctx.beginPath();
      ctx.ellipse(centerX, centerY * 1.6, centerX * 0.25, centerY * 0.04, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
      ctx.fill();

      ctx.restore();
    };

    // Initialize falling texts
    const leftTexts = ['I LOVE YOU', 'Mai Anh ❤️', '我爱你', '女朋友'];
    const rightTexts = ['Mai Anh ❤️', 'I love you ', '女朋友❤️', '我爱你'];
    
    // Create multiple columns of falling text
    leftTextsRef.current = [];
    rightTextsRef.current = [];
    
    // Create 3 columns of falling text on each side
    for (let col = 0; col < 3; col++) {
      leftTexts.forEach((text, i) => {
        leftTextsRef.current.push(
          new FallingText(
            text,
            centerX * (0.15 + col * 0.1), // Multiple columns
            -i * 100, // Reduced spacing between texts
            1.5 + Math.random(), // Increased base speed
            'rgba(255, 255, 255, 1)'
          )
        );
      });
      
      rightTexts.forEach((text, i) => {
        rightTextsRef.current.push(
          new FallingText(
            text,
            centerX * (1.85 - col * 0.1),
            -i * 100, // Reduced spacing between texts
            1.5 + Math.random(), // Increased base speed
            'rgba(255, 255, 255, 1)'
          )
        );
      });
    }

    // Initialize falling hearts
    fallingHeartsRef.current = Array(30).fill().map(() => 
      new FallingHeart(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight
      )
    );

    // Update the animate function to clear the canvas completely each frame
    const animate = () => {
      // Clear canvas completely instead of leaving trails
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Change from 0.1 to 1 for complete clear
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      time += 0.02;
      // Cập nhật góc xoay
      rotationRef.current += 0.02; // Có thể điều chỉnh tốc độ này

      // Update heart particles
      heartParticles = heartParticles.filter(particle => {
        particle.update();
        return particle.life > 0;
      });

      // Vẽ trái tim với xoay
      drawRotatedHeart(ctx, time);

      // Update and draw platform particles
      platformParticles = platformParticles.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return particle.life > 0;
      });

      // Add new platform particles
      if (platformParticles.length < 100) {
        const newParticles = generatePlatformParticles();
        platformParticles.push(...newParticles.slice(0, 5));
      }

      // Update and draw bubbles
      platformBubblesRef.current = platformBubblesRef.current.filter(bubble => {
        bubble.y -= bubble.speed;
        bubble.opacity -= 0.008; // Giảm từ 0.01 xuống 0.008 để bong bóng tồn tại lâu hơn
        
        if (bubble.opacity <= 0) return false;
        
        // Draw bubble
        ctx.save();
        ctx.globalAlpha = bubble.opacity;
        
        // Bubble glow
        const bubbleGradient = ctx.createRadialGradient(
          bubble.x, bubble.y, 0,
          bubble.x, bubble.y, bubble.size * 2
        );
        bubbleGradient.addColorStop(0, 'rgba( 255, 0,0, 0.8)');
        bubbleGradient.addColorStop(0.5, 'rgba(0, 153, 255, 0.4)');
        bubbleGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = bubbleGradient;
        ctx.fill();
        
        ctx.restore();
        return true;
      });
      
      // Add new bubbles
      if (Math.random() < 0.35) { // Tăng từ 0.25 lên 0.35 (35% mỗi frame)
        platformBubblesRef.current.push(createBubble());
        // Thêm nhiều bong bóng cùng lúc
        if (Math.random() < 0.6) { // Tăng từ 0.5 lên 0.6 (60% cơ hội)
          platformBubblesRef.current.push(createBubble());
          if (Math.random() < 0.4) { // 40% cơ hội thêm bong bóng thứ ba
            platformBubblesRef.current.push(createBubble());
          }
        }
      }

      // Update and draw falling texts
      leftTextsRef.current.forEach(text => {
        text.update(canvas.height);
        text.draw(ctx);
      });

      rightTextsRef.current.forEach(text => {
        text.update(canvas.height);
        text.draw(ctx);
      });

      // Vẽ platform với xoay
      drawRotatedPlatform(ctx);

      // Add floating sparkles
      for (let i = 0; i < 5; i++) {
        const sparkleX = Math.random() * canvas.width;
        const sparkleY = Math.random() * canvas.height;
        const sparkleSize = Math.random() * 2 + 1;
        
        ctx.save();
        ctx.globalAlpha = Math.sin(time * 3 + i) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // Randomly add new complete texts
      if (Math.random() < 0.03) { // Reduced chance for less frequent spawning
        const side = Math.random() < 0.5;
        const texts = side ? leftTexts : rightTexts;
        const text = texts[Math.floor(Math.random() * texts.length)];
        const ref = side ? leftTextsRef : rightTextsRef;
        const x = side ? 
          centerX * (0.15 + Math.random() * 0.2) : 
          centerX * (1.75 + Math.random() * 0.2);
        
        ref.current.push(
          new FallingText(
            text,
            x,
            -50,
            1.2 + Math.random(), // Slightly faster speed
            'rgba(255, 255, 255, 1)'
          )
        );
      }

      // Update and draw falling hearts
      fallingHeartsRef.current.forEach(heart => {
        heart.update(canvas.height);
        heart.draw(ctx);
      });

      // Add new hearts occasionally
      if (Math.random() < 0.1) {
        fallingHeartsRef.current.push(
          new FallingHeart(
            Math.random() * canvas.width,
            -50
          )
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animate();

    // Clean up
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update the container style
  return (
    <div className="fixed inset-0 bg-black touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          filter: 'blur(0.5px)',
          background: 'radial-gradient(circle at center, #001122 0%, #000000 100%)',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite alternate'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default GlowingHeartAnimation;