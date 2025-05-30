import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export default function Home() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Camera position
        camera.position.z = 50;

        // OrbitControls for interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;

        // Universe background
        const textureLoader = new THREE.TextureLoader();
        const stars = textureLoader.load('/stars.jpg');
        scene.background = stars;

        // Create text objects
        const texts = ['mai anh', 'i love you', '21-01-2003'];
        const fontLoader = new FontLoader();
        fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
                const textMeshes = [];
                const radius = 20;
                const numPoints = texts.length;

                texts.forEach((text, index) => {
                    const geometry = new TextGeometry(text, {
                        font: font,
                        size: 2,
                        height: 0.2,
                    });
                    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                    const textMesh = new THREE.Mesh(geometry, material);

                    // Position texts on a sphere
                    const theta = (index / numPoints) * Math.PI * 2;
                    const phi = Math.acos(1 - (2 * index) / numPoints);
                    const x = radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.sin(phi) * Math.sin(theta);
                    const z = radius * Math.cos(phi);

                    textMesh.position.set(x, y, z);
                    textMesh.lookAt(0, 0, 0); // Make text face outward
                    scene.add(textMesh);
                    textMeshes.push(textMesh);
                });

                // Animation loop
                const animate = () => {
                    requestAnimationFrame(animate);
                    // Rotate text sphere
                    textMeshes.forEach((mesh, index) => {
                        const theta = ((index / numPoints) * Math.PI * 2 + Date.now() * 0.0001) % (Math.PI * 2);
                        const phi = Math.acos(1 - (2 * index) / numPoints);
                        const x = radius * Math.sin(phi) * Math.cos(theta);
                        const y = radius * Math.sin(phi) * Math.sin(theta);
                        const z = radius * Math.cos(phi);
                        mesh.position.set(x, y, z);
                        mesh.lookAt(0, 0, 0);
                    });

                    // Subtle background movement
                    scene.rotation.y += 0.0001;
                    controls.update();
                    renderer.render(scene, camera);
                };
                animate();
            }
        );

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            // Dispose of Three.js resources
            renderer.dispose();
            scene.clear();
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
}