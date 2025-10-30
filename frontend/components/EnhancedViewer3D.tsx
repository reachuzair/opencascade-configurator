'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3D, Cylinder3D, Cone3D, Sphere3D } from './Shapes3D';

type ShapeType = 'box' | 'cylinder' | 'cone' | 'sphere';

interface EnhancedViewer3DProps {
  shapeType: ShapeType;
  parameters: any;
  material?: {
    color: string;
    finish: 'matte' | 'glossy' | 'metallic';
  };
}

export default function EnhancedViewer3D({
  shapeType,
  parameters,
  material,
}: EnhancedViewer3DProps) {
  const getMaterialProps = () => {
    const color = material?.color || '#3b82f6';
    const finish = material?.finish || 'matte';

    const finishProps = {
      matte: { metalness: 0.1, roughness: 0.9 },
      glossy: { metalness: 0.2, roughness: 0.2 },
      metallic: { metalness: 0.9, roughness: 0.1 },
    };

    return { color, ...finishProps[finish] };
  };

  const props = getMaterialProps();
  const maxDim = Math.max(
    parameters.width || 0,
    parameters.height || 0,
    parameters.depth || 0,
    parameters.radius ? parameters.radius * 2 : 0
  );

  const cameraDistance = maxDim * 1.5;

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden border border-slate-200">
      <Canvas
        camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <hemisphereLight intensity={0.5} groundColor="#444444" />

        {/* Grid */}
        <gridHelper args={[200, 20, '#64748b', '#94a3b8']} position={[0, -50, 0]} />

        {/* Render shape based on type */}
        {shapeType === 'box' && (
          <Box3D
            width={parameters.width}
            height={parameters.height}
            depth={parameters.depth}
            {...props}
          />
        )}
        {shapeType === 'cylinder' && (
          <Cylinder3D radius={parameters.radius} height={parameters.height} {...props} />
        )}
        {shapeType === 'cone' && (
          <Cone3D radius={parameters.radius} height={parameters.height} {...props} />
        )}
        {shapeType === 'sphere' && <Sphere3D radius={parameters.radius} {...props} />}

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

