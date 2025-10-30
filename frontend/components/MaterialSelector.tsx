'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Material {
  name: string;
  density: number;
  color: string;
  finish: 'matte' | 'glossy' | 'metallic';
  cost?: number;
}

const MATERIALS: Record<string, Material> = {
  steel: {
    name: 'Steel',
    density: 7850,
    color: '#888888',
    finish: 'metallic',
    cost: 0.0001,
  },
  aluminum: {
    name: 'Aluminum',
    density: 2700,
    color: '#CCCCCC',
    finish: 'metallic',
    cost: 0.0002,
  },
  plastic: {
    name: 'Plastic (ABS)',
    density: 1050,
    color: '#FFFFFF',
    finish: 'matte',
    cost: 0.00005,
  },
  wood: {
    name: 'Wood (Oak)',
    density: 750,
    color: '#8B4513',
    finish: 'matte',
    cost: 0.00008,
  },
  brass: {
    name: 'Brass',
    density: 8500,
    color: '#B5A642',
    finish: 'metallic',
    cost: 0.0003,
  },
};

interface MaterialSelectorProps {
  selectedMaterial: string;
  onMaterialChange: (materialKey: string) => void;
  volume?: number; // mm³
}

export default function MaterialSelector({
  selectedMaterial,
  onMaterialChange,
  volume,
}: MaterialSelectorProps) {
  const material = MATERIALS[selectedMaterial] || MATERIALS.steel;
  const weight = volume ? (volume / 1000000) * material.density : 0; // grams
  const cost = volume && material.cost ? (volume * material.cost).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Material</Label>
        <Select value={selectedMaterial} onValueChange={onMaterialChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MATERIALS).map(([key, mat]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: mat.color }}
                  />
                  {mat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material Properties */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: material.color }}
          />
          <div>
            <p className="font-semibold">{material.name}</p>
            <p className="text-xs text-slate-600 capitalize">{material.finish} finish</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <p className="text-slate-600">Density</p>
            <p className="font-mono font-semibold">{material.density} kg/m³</p>
          </div>
          {volume && volume > 0 && (
            <>
              <div>
                <p className="text-slate-600">Weight</p>
                <p className="font-mono font-semibold">{weight.toFixed(2)} g</p>
              </div>
              <div>
                <p className="text-slate-600">Est. Cost</p>
                <p className="font-mono font-semibold">${cost}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { MATERIALS };

