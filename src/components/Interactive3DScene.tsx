import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import { useRef, useState } from 'react';
import { Mesh } from 'three';

interface Interactive3DProps {
  type: 'football' | 'chart';
  size?: number;
  position?: [number, number, number];
}

function Football({ size = 1, position = [0, 0, 0] }: { size?: number; position?: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      if (hovered) {
        meshRef.current.scale.setScalar(size * 1.1);
      } else {
        meshRef.current.scale.setScalar(size);
      }
    }
  });

  return (
    <Sphere
      ref={meshRef}
      position={position}
      args={[1, 32, 32]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color="#ff3036"
        roughness={0.3}
        metalness={0.1}
        emissive="#ff3036"
        emissiveIntensity={hovered ? 0.2 : 0.05}
      />
    </Sphere>
  );
}

function Chart3D({ size = 1, position = [0, 0, 0] }: { size?: number; position?: [number, number, number] }) {
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      if (hovered) {
        groupRef.current.scale.setScalar(size * 1.05);
      } else {
        groupRef.current.scale.setScalar(size);
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {[1, 2, 3, 4, 5].map((height, index) => (
        <Box
          key={index}
          position={[(index - 2) * 0.5, height * 0.2, 0]}
          args={[0.3, height * 0.4, 0.3]}
        >
          <meshStandardMaterial
            color={`hsl(${index * 60}, 70%, 60%)`}
            roughness={0.2}
            metalness={0.3}
            emissive={`hsl(${index * 60}, 70%, 30%)`}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </Box>
      ))}
    </group>
  );
}

export const Interactive3DScene = ({ type, size = 1, position = [0, 0, 0] }: Interactive3DProps) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        
        {type === 'football' ? (
          <Football size={size} position={position} />
        ) : (
          <Chart3D size={size} position={position} />
        )}
      </Canvas>
    </div>
  );
};