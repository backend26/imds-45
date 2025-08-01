import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Enhanced3DFootballProps {
  size?: number;
}

export const Enhanced3DFootball = ({ size = 1 }: Enhanced3DFootballProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ballRef = useRef<THREE.Mesh>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(200 * size, 200 * size);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Football creation
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100
    });

    // Add football pattern
    const patternTexture = new THREE.CanvasTexture(createFootballPattern());
    material.map = patternTexture;

    const ball = new THREE.Mesh(geometry, material);
    ballRef.current = ball;
    scene.add(ball);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    camera.position.z = 3;

    // Mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = (-(event.clientY - rect.top) / rect.height + 0.5) * 2;
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (ballRef.current) {
        // Gentle rotation
        ballRef.current.rotation.y += 0.01;

        // Mouse-reactive movement
        ballRef.current.rotation.x = mouseRef.current.y * 0.3;
        ballRef.current.rotation.z = mouseRef.current.x * 0.3;

        // Subtle floating animation
        ballRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      mountRef.current?.removeEventListener('mousemove', handleMouseMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [size]);

  const createFootballPattern = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // White base
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 512, 512);

    // Black pentagons pattern
    ctx.fillStyle = 'black';
    const centerX = 256;
    const centerY = 256;

    // Draw pentagon pattern
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 80;
      const y = centerY + Math.sin(angle) * 80;

      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const pentAngle = (j / 5) * Math.PI * 2;
        const px = x + Math.cos(pentAngle) * 20;
        const py = y + Math.sin(pentAngle) * 20;

        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    return canvas;
  };

  return <div ref={mountRef} className="hero-element" />;
};