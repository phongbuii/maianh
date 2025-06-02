import React, { useEffect, useRef } from 'react';

const GlowingHeartAnimation = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Particle class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.3; // Reduced speed
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.life = 1;
                this.decay = Math.random() * 0.01 + 0.003; // Slower decay
                this.glow = Math.random() * 0.5 + 0.5;
                this.initialX = x; // Store initial position
                this.initialY = y;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= this.decay;

                // Reset particle when it dies
                if (this.life <= 0) {
                    this.x = this.initialX;
                    this.y = this.initialY;
                    this.life = 1;
                }
            }

            draw(ctx) {
                if (this.life <= 0) return;

                ctx.save();
                ctx.globalAlpha = this.life * this.glow;

                // Create gradient for glow effect
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
                gradient.addColorStop(0, 'red');
                gradient.addColorStop(0.3, '#0099ff');
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core particle
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.restore();
            }
        }

        // Heart shape function
        const createHeartShape = (t) => {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return { x: x * 8 + 400, y: y * 8 + 200 };
        };

        // Generate heart particles
        const generateHeartParticles = () => {
            const particles = [];
            for (let t = 0; t < Math.PI * 2; t += 0.1) {
                const point = createHeartShape(t);
                // Create more particles per point
                for (let i = 0; i < 5; i++) { // Increased from 3
                    const offsetX = (Math.random() - 0.5) * 15;
                    const offsetY = (Math.random() - 0.5) * 15;
                    particles.push(new Particle(point.x + offsetX, point.y + offsetY));
                }
            }
            return particles;
        };

        // Platform particles
        const generatePlatformParticles = () => {
            const particles = [];
            const platformY = 450;
            const platformWidth = 250; // Increased width
            const centerX = 400;

            // Increase number of particles
            for (let i = 0; i < 100; i++) { // Increased from 50
                const x = centerX + (Math.random() - 0.5) * platformWidth;
                const y = platformY + (Math.random() - 0.5) * 15; // Increased spread
                const particle = new Particle(x, y);
                particle.size = Math.random() * 4 + 2; // Bigger particles
                particle.glow = Math.random() * 0.7 + 0.3; // More glow
                particles.push(particle);
            }
            return particles;
        };

        let time = 0;
        let heartParticles = generateHeartParticles();
        let platformParticles = generatePlatformParticles();

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.02;

            // Update and draw heart particles with upward movement
            heartParticles.forEach(particle => {
                particle.update();
                particle.y -= 0.5; // Add upward movement
                // Reset particle if it goes above screen
                if (particle.y < -50) {
                    particle.y = canvas.height + 50;
                    particle.x = Math.random() * canvas.width;
                }
                particle.draw(ctx);
            });

            // Increase bubble count
            if (heartParticles.length < 800) { // Increased from 500
                const newParticles = generateHeartParticles();
                heartParticles.push(...newParticles);
            }

            // Update and draw platform particles
            platformParticles = platformParticles.filter(particle => {
                particle.update();
                particle.draw(ctx);
                return particle.life > 0;
            });

            // Add new platform particles
            if (platformParticles.length < 200) { // Increased from 100
                const newParticles = generatePlatformParticles();
                platformParticles.push(...newParticles.slice(0, 10)); // Add more particles per frame
            }

            // Draw glowing platform
            ctx.save();
            ctx.globalAlpha = 0.8;

            // Platform glow
            const platformGradient = ctx.createRadialGradient(400, 450, 0, 400, 450, 250); // Increased radius
            platformGradient.addColorStop(0, 'rgba(255, 0, 0, 1)'); // More intense red
            platformGradient.addColorStop(0.4, 'rgba(0, 153, 255, 0.8)'); // Brighter blue
            platformGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.ellipse(400, 450, 150, 30, 0, 0, Math.PI * 2); // Larger platform
            ctx.fillStyle = platformGradient;
            ctx.fill();

            // Platform core
            ctx.beginPath();
            ctx.ellipse(400, 450, 80, 15, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
            ctx.fill();

            ctx.restore();

            // Add more platform particles
            for (let i = 0; i < 25; i++) { // Increased particle count
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 150;
                const x = 400 + Math.cos(angle) * radius;
                const y = 450 + Math.sin(angle) * radius * 0.2;

                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`;
                ctx.fill();
            }

            // Add more floating sparkles
            for (let i = 0; i < 15; i++) { // Increased from 5
                const sparkleX = Math.random() * canvas.width;
                const sparkleY = Math.random() * canvas.height;
                const sparkleSize = Math.random() * 3 + 1; // Increased size variation

                ctx.save();
                ctx.globalAlpha = Math.sin(time * 3 + i) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.restore();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        // Initial clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="border border-gray-800 rounded-lg shadow-2xl"
                    style={{
                        filter: 'blur(0.5px)',
                        background: 'radial-gradient(circle at center, #001122 0%, #000000 100%)'
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