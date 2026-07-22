import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Globe = ({ onClose }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 800, height: 600 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}>
          ×
        </button>
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Sphere />
          <OrbitControls enableZoom={true} />
          <Stars />
        </Canvas>
      </div>
    </div>
  );
};

const Sphere = () => (
  <mesh>
    <sphereGeometry args={[1, 64, 64]} />
    <meshStandardMaterial
      color="#228be6"
      metalness={0}
      roughness={1}
    />
  </mesh>
);

const Stars = () => {
  const stars = [];
  const count = 10000;
  const radius = 100;
  const vertices = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    vertices[3 * i] = x;
    vertices[3 * i + 1] = y;
    vertices[3 * i + 2] = z;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
  return <points geometry={starGeometry} material={starMaterial} />;
};

export default Globe;
