'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ParametricBoxProps {
    width: number;
    height: number;
    depth: number;
    color?: string;
}

/**
 * Parametric Box Component
 * Renders a 3D box with specified dimensions
 */
export default function ParametricBox({
    width,
    height,
    depth,
    color = '#3b82f6'
}: ParametricBoxProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const edgesRef = useRef<THREE.LineSegments>(null);

    // Gentle rotation animation
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
        if (edgesRef.current) {
            edgesRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group>
            {/* Main box mesh */}
            <mesh ref={meshRef}>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.8}
                    metalness={0.3}
                    roughness={0.4}
                />
            </mesh>

            {/* Edge lines for better visibility */}
            <lineSegments ref={edgesRef}>
                <edgesGeometry args={[new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth))]} />
                <lineBasicMaterial color="#1e293b" />
            </lineSegments>
        </group>
    );
}

