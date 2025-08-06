import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Enhanced3DFootballProps {
  className?: string;
  size?: number;
}

export const Enhanced3DFootball: React.FC<Enhanced3DFootballProps> = ({ 
  className = "", 
  size = 2 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const footballRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, 
      1, 
      0.1, 
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      premultipliedAlpha: false
    });
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create football group
    const footballGroup = new THREE.Group();
    scene.add(footballGroup);
    footballRef.current = footballGroup;

    // Main football sphere
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 30
    });
    const football = new THREE.Mesh(geometry, material);
    footballGroup.add(football);

    // Create pentagon pattern
    const createPentagon = (radius: number, color: number) => {
      const shape = new THREE.Shape();
      const angle = Math.PI * 2 / 5;
      
      shape.moveTo(radius, 0);
      for (let i = 1; i <= 5; i++) {
        const x = radius * Math.cos(i * angle);
        const y = radius * Math.sin(i * angle);
        shape.lineTo(x, y);
      }
      
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshBasicMaterial({ color });
      return new THREE.Mesh(geometry, material);
    };

    // Add pentagon patterns
    const pentagons = [];
    for (let i = 0; i < 12; i++) {
      const pentagon = createPentagon(0.4, 0x000000);
      const phi = Math.acos(-1/3);
      const theta = (2 * Math.PI * i) / 5;
      
      pentagon.position.setFromSphericalCoords(size + 0.01, phi, theta);
      pentagon.lookAt(0, 0, 0);
      pentagon.scale.setScalar(0.8);
      footballGroup.add(pentagon);
      pentagons.push(pentagon);
    }

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (footballRef.current) {
        // Smooth rotation based on mouse
        footballRef.current.rotation.x += (targetRotationX - footballRef.current.rotation.x) * 0.02;
        footballRef.current.rotation.y += (targetRotationY - footballRef.current.rotation.y) * 0.02;
        
        // Add gentle continuous rotation
        footballRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      targetRotationX = mouseY * 0.5;
      targetRotationY = mouseX * 0.5;
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  return (
    <div 
      ref={mountRef} 
      className={`w-48 h-48 ${className}`}
      style={{ width: '200px', height: '200px' }}
    />
  );
};