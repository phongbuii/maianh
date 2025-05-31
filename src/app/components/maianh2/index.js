import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CloudRain } from 'lucide-react';

// 1. Update initial state
export default function HeartRain() {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true); // Default to true
    const [hearts, setHearts] = useState([]);
    const animationRef = useRef();

    // Tạo một trái tim từ particles
    const createHeartParticles = (centerX, centerY, scale = 30) => {
        const particles = [];

        // Tăng số lớp
        for (let layer = 0; layer < 5; layer++) { // Increased from 3
            const layerScale = scale * (0.8 + layer * 0.2);
            const particleCount = 60 + layer * 25; // Increased from 45 + layer * 20

            for (let i = 0; i < particleCount; i++) {
                const t = (i / particleCount) * 2 * Math.PI;

                // Công thức trái tim
                const heartX = layerScale * Math.pow(Math.sin(t), 3);
                const heartY = -layerScale * (
                    0.8125 * Math.cos(t) -
                    0.3125 * Math.cos(2 * t) -
                    0.125 * Math.cos(3 * t) -
                    0.0625 * Math.cos(4 * t)
                );

                const randomOffset = 2;
                const x = centerX + heartX + (Math.random() - 0.5) * randomOffset;
                const y = centerY + heartY + (Math.random() - 0.5) * randomOffset;

                particles.push({
                    x: x - centerX, // Relative to heart center
                    y: y - centerY,
                    size: Math.random() * 1.5 + 0.8,
                    opacity: Math.random() * 0.6 + 0.4,
                    phase: Math.random() * Math.PI * 2,
                    color: {
                        r: 255,
                        g: Math.floor(Math.random() * 40), // Redder hearts
                        b: Math.floor(Math.random() * 40),
                        glow: Math.random() * 10 + 5 // Add glow effect
                    }
                });
            }
        }

        // Thêm nhiều particles bên trong
        for (let i = 0; i < 35; i++) { // Increased from 25
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * scale * 0.3 + scale * 0.3;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.8;

            // Kiểm tra xem có nằm trong trái tim không
            if (isInsideHeart(x, y, scale)) {
                particles.push({
                    x: x,
                    y: y,
                    size: Math.random() * 1.2 + 0.5,
                    opacity: Math.random() * 0.3 + 0.2,
                    phase: Math.random() * Math.PI * 2,
                    color: {
                        r: 255,
                        g: Math.floor(Math.random() * 40 + 20), // More red
                        b: Math.floor(Math.random() * 40 + 20)  // More red
                    }
                });
            }
        }

        return particles;
    };

    // Kiểm tra điểm có nằm trong hình trái tim không
    const isInsideHeart = (x, y, scale) => {
        const normalizedX = x / scale;
        const normalizedY = -y / scale;

        const equation = Math.pow(normalizedX * normalizedX + normalizedY * normalizedY - 1, 3) -
            normalizedX * normalizedX * normalizedY * normalizedY * normalizedY;
        return equation <= 0;
    };

    // Tạo các trái tim rơi
    const createFallingHearts = () => {
        const newHearts = [];
        const width = window.innerWidth;  // Get full window width

        // Tăng số lượng trái tim
        for (let i = 0; i < 50; i++) { // Increased from 35
            const scale = Math.random() * 30 + 40; // Increased scale range
            const heart = {
                id: i,
                x: Math.random() * width, // Use full window width
                y: -100 - Math.random() * 200, // Bắt đầu từ trên cao
                scale: scale,
                speed: Math.random() * 3.5 + 1.5, // Slightly faster
                rotation: Math.random() * 0.02 - 0.01, // Xoay nhẹ
                swaySpeed: Math.random() * 0.01 + 0.005, // Tốc độ lắc lư
                swayAmount: Math.random() * 30 + 10, // Độ lắc lư
                opacity: Math.random() * 0.8 + 0.8, // More visible
                phase: Math.random() * Math.PI * 2,
                particles: createHeartParticles(0, 0, scale),
                currentRotation: 0,
                birthTime: Date.now() + i * 300 // Reduced delay between spawns
            };

            newHearts.push(heart);
        }

        setHearts(newHearts);
    };

    // Animation loop
    const animate = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const currentTime = Date.now();

        // Clear canvas với fade effect
        ctx.fillStyle = 'rgba(15, 15, 25, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        hearts.forEach(heart => {
            // Chỉ hiển thị heart nếu đã đến thời gian sinh
            if (currentTime < heart.birthTime) return;

            const time = (currentTime - heart.birthTime) * 0.001;

            // Cập nhật vị trí
            heart.y += heart.speed;
            heart.x += Math.sin(time * heart.swaySpeed) * heart.swayAmount * 0.01;
            heart.currentRotation += heart.rotation;

            // Reset nếu rơi xuống dưới
            if (heart.y > window.innerHeight) {  // Use window height
                heart.y = -100 - Math.random() * 100;
                heart.x = Math.random() * window.innerWidth;  // Use window width
                heart.birthTime = currentTime + Math.random() * 2000;
            }

            // Vẽ trái tim
            ctx.save();
            ctx.translate(heart.x, heart.y);
            ctx.rotate(heart.currentRotation);

            // Hiệu ứng đập nhẹ
            const pulse = Math.sin(time * 3 + heart.phase) * 0.1 + 1;
            ctx.scale(pulse, pulse);

            heart.particles.forEach(particle => {
                const particleTime = time + particle.phase;
                const wave = Math.sin(particleTime * 2) * 0.5;

                const x = particle.x + wave;
                const y = particle.y + wave * 0.5;
                const size = particle.size * (isPlaying ? 1 + Math.sin(particleTime * 4) * 0.2 : 1);
                const opacity = particle.opacity * heart.opacity;

                // Vẽ particle với glow
                ctx.save();
                ctx.globalAlpha = opacity;

                const r = particle.color.r;
                const g = particle.color.g;
                const b = particle.color.b;

                // Outer glow
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
                gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.4)`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Core particle
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            ctx.restore();
        });

        if (isPlaying) {
            animationRef.current = requestAnimationFrame(animate);
        }
    };

    const drawStatic = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(15, 15, 25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        hearts.forEach(heart => {
            ctx.save();
            ctx.translate(heart.x, heart.y);
            ctx.globalAlpha = heart.opacity * 0.7;

            heart.particles.forEach(particle => {
                const r = Math.floor(particle.color.r * 0.6);
                const g = Math.floor(particle.color.g * 0.6);
                const b = Math.floor(particle.color.b * 0.6);

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        });
    };

    useEffect(() => {
        createFallingHearts();
    }, []);

    useEffect(() => {
        if (isPlaying) {
            animate();
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            drawStatic();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, hearts]);

    const toggleAnimation = () => {
        setIsPlaying(!isPlaying);
    };

    const resetRain = () => {
        createFallingHearts();
    };

    // 2. Update canvas size on mount and resize
    useEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, []);

    // 3. Simplified return without controls
    return (
        <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-purple-900 to-indigo-900">
                {/* Background particles */}
                {[...Array(200)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-pink-500/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            transform: `scale(${Math.random() * 2 + 1})`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ background: 'transparent' }}
            />
        </div>
    );
}