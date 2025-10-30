"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface CADViewerProps {
    stlUrl?: string | null;
    preview?: {
        boundingBox?: {
            min: number[];
            max: number[];
        };
        center?: number[];
    };
    material?: string; // e.g., Steel, Aluminum, Plastic, Glass
}

function materialToThreeProps(material?: string) {
    const key = (material || '').toLowerCase();
    switch (key) {
        case 'steel':
            return { color: '#495057', metalness: 0.8, roughness: 0.35, transparent: false, opacity: 1 };
        case 'aluminum':
            return { color: '#bfc5cd', metalness: 0.9, roughness: 0.2, transparent: false, opacity: 1 };
        case 'glass':
            return { color: '#9ee7ff', metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.35 };
        case 'plastic':
        default:
            return { color: '#4f46e5', metalness: 0.3, roughness: 0.4, transparent: false, opacity: 1 };
    }
}

function STLModel({ url, material }: { url: string; material?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [geometry, setGeometry] = React.useState<THREE.BufferGeometry | null>(null);
    const matProps = materialToThreeProps(material);

    useEffect(() => {
        const loader = new STLLoader();
        loader.load(
            url,
            (geo) => {
                geo.center();
                setGeometry(geo);
            },
            undefined,
            (error) => {
                console.error("Error loading STL:", error);
            }
        );
    }, [url]);

    if (!geometry) {
        return <Box position={[0, 0, 0]} args={[50, 50, 50]} />;
    }

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial
                color={matProps.color as any}
                metalness={matProps.metalness}
                roughness={matProps.roughness}
                transparent={matProps.transparent}
                opacity={matProps.opacity}
            />
        </mesh>
    );
}

interface BoxProps {
    args: [number, number, number];
    position: [number, number, number];
}

function Box({ args, position }: BoxProps) {
    return (
        <mesh position={position}>
            <boxGeometry args={args} />
            <meshStandardMaterial color="#4f46e5" metalness={0.3} roughness={0.4} />
        </mesh>
    );
}

function PlaceholderBox() {
    return (
        <group>
            <Box args={[100, 100, 100]} position={[0, 0, 0]} />
        </group>
    );
}

export function CADViewer({ stlUrl, material }: CADViewerProps) {
    return (
        <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <Canvas
                camera={{ position: [150, 150, 150], fov: 50 }}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />
                <hemisphereLight intensity={0.5} groundColor="#444444" />

                {/* Grid */}
                <gridHelper args={[400, 40, "#64748b", "#94a3b8"]} position={[0, -100, 0]} />

                {/* Render model */}
                {stlUrl ? <STLModel url={stlUrl} material={material} /> : <PlaceholderBox />}

                {/* Camera controls */}
                <OrbitControls enableDamping dampingFactor={0.05} minDistance={50} maxDistance={800} />
            </Canvas>
        </div>
    );
}

