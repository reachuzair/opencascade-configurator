'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ShapeProps {
  color?: string;
  metalness?: number;
  roughness?: number;
}

export function Box3D({ width, height, depth, color = '#3b82f6', metalness = 0.3, roughness = 0.4 }: {
  width: number;
  height: number;
  depth: number;
} & ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
    if (edgesRef.current) edgesRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#1e293b" />
      </lineSegments>
    </group>
  );
}

export function Cylinder3D({ radius, height, color = '#3b82f6', metalness = 0.3, roughness = 0.4 }: {
  radius: number;
  height: number;
} & ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
    if (edgesRef.current) edgesRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.CylinderGeometry(radius, radius, height, 32)]} />
        <lineBasicMaterial color="#1e293b" />
      </lineSegments>
    </group>
  );
}

export function Cone3D({ radius, height, color = '#3b82f6', metalness = 0.3, roughness = 0.4 }: {
  radius: number;
  height: number;
} & ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
    if (edgesRef.current) edgesRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <coneGeometry args={[radius, height, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.ConeGeometry(radius, height, 32)]} />
        <lineBasicMaterial color="#1e293b" />
      </lineSegments>
    </group>
  );
}

export function Sphere3D({ radius, color = '#3b82f6', metalness = 0.3, roughness = 0.4 }: {
  radius: number;
} & ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
    if (edgesRef.current) edgesRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.SphereGeometry(radius, 32, 32)]} />
        <lineBasicMaterial color="#1e293b" />
      </lineSegments>
    </group>
  );
}

