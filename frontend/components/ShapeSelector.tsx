'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Box, Circle, Triangle, CircleIcon as SphereIcon } from 'lucide-react';

export type ShapeType = 'box' | 'cylinder' | 'cone' | 'sphere';
interface ShapeParameters {
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  topRadius?: number;
  bottomRadius?: number;
}

interface ShapeSelectorProps {
  shapeType: ShapeType;
  parameters: ShapeParameters;
  onShapeChange: (type: ShapeType) => void;
  onParameterChange: (param: string, value: number) => void;
}

const shapeIcons = {
  box: Box,
  cylinder: Circle,
  cone: Triangle,
  sphere: SphereIcon,
};

export default function ShapeSelector({
  shapeType,
  parameters,
  onShapeChange,
  onParameterChange,
}: ShapeSelectorProps) {
  const Icon = shapeIcons[shapeType];

  return (
    <div className="space-y-6">
      {/* Shape Type Selector */}
      <div className="space-y-2">
        <Label>Shape Type</Label>
        <Select value={shapeType} onValueChange={(value: ShapeType) => onShapeChange(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="box">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                Box
              </div>
            </SelectItem>
            <SelectItem value="cylinder">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Cylinder
              </div>
            </SelectItem>
            <SelectItem value="cone">
              <div className="flex items-center gap-2">
                <Triangle className="w-4 h-4" />
                Cone
              </div>
            </SelectItem>
            <SelectItem value="sphere">
              <div className="flex items-center gap-2">
                <SphereIcon className="w-4 h-4" />
                Sphere
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shape Parameters */}
      <div className="space-y-4">
        {shapeType === 'box' && (
          <>
            <ParameterControl
              label="Width (mm)"
              value={parameters.width || 100}
              onChange={(v) => onParameterChange('width', v)}
            />
            <ParameterControl
              label="Height (mm)"
              value={parameters.height || 100}
              onChange={(v) => onParameterChange('height', v)}
            />
            <ParameterControl
              label="Depth (mm)"
              value={parameters.depth || 100}
              onChange={(v) => onParameterChange('depth', v)}
            />
          </>
        )}

        {(shapeType === 'cylinder' || shapeType === 'cone') && (
          <>
            <ParameterControl
              label="Radius (mm)"
              value={parameters.radius || 50}
              onChange={(v) => onParameterChange('radius', v)}
            />
            <ParameterControl
              label="Height (mm)"
              value={parameters.height || 100}
              onChange={(v) => onParameterChange('height', v)}
            />
          </>
        )}

        {shapeType === 'sphere' && (
          <ParameterControl
            label="Radius (mm)"
            value={parameters.radius || 50}
            onChange={(v) => onParameterChange('radius', v)}
          />
        )}
      </div>
    </div>
  );
}

function ParameterControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 text-right"
          min={10}
          max={500}
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={10}
        max={500}
        step={5}
        className="w-full"
      />
    </div>
  );
}

