'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import ParametricBox from './ParametricBox';

interface Viewer3DProps {
    width: number;
    height: number;
    depth: number;
}

/**
 * 3D Viewer Component
 * Renders the 3D scene with camera controls and lighting
 */
export default function Viewer3D({ width, height, depth }: Viewer3DProps) {
    return (
        <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <Canvas
                camera={{ position: [width * 1.5, height * 1.5, depth * 1.5], fov: 50 }}
                shadows
            >
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />

                {/* Environment for better reflections */}
                <Environment preset="city" />

                {/* Grid helper */}
                <Grid
                    args={[100, 100]}
                    cellSize={10}
                    cellThickness={0.5}
                    cellColor="#94a3b8"
                    sectionSize={50}
                    sectionThickness={1}
                    sectionColor="#64748b"
                    fadeDistance={200}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid
                />

                {/* Parametric Box */}
                <ParametricBox width={width} height={height} depth={depth} />

                {/* Camera controls */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={10}
                    maxDistance={500}
                />
            </Canvas>
        </div>
    );
}

