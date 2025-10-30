/**
 * M3: Shape type definitions
 */

export type ShapeType = "box" | "cylinder" | "cone" | "sphere";

export interface BaseShape {
  type: ShapeType;
  material?: Material;
}

export interface BoxShape extends BaseShape {
  type: "box";
  width: number;
  height: number;
  depth: number;
}

export interface CylinderShape extends BaseShape {
  type: "cylinder";
  radius: number;
  height: number;
}

export interface ConeShape extends BaseShape {
  type: "cone";
  radius: number;
  height: number;
}

export interface SphereShape extends BaseShape {
  type: "sphere";
  radius: number;
}

export type Shape = BoxShape | CylinderShape | ConeShape | SphereShape;

export interface Material {
  name: string;
  density: number; // kg/m³
  color: string; // hex color
  finish: "matte" | "glossy" | "metallic";
  cost?: number; // per cubic mm
}

export const MATERIALS: Record<string, Material> = {
  steel: {
    name: "Steel",
    density: 7850,
    color: "#888888",
    finish: "metallic",
    cost: 0.0001,
  },
  aluminum: {
    name: "Aluminum",
    density: 2700,
    color: "#CCCCCC",
    finish: "metallic",
    cost: 0.0002,
  },
  plastic: {
    name: "Plastic (ABS)",
    density: 1050,
    color: "#FFFFFF",
    finish: "matte",
    cost: 0.00005,
  },
  wood: {
    name: "Wood (Oak)",
    density: 750,
    color: "#8B4513",
    finish: "matte",
    cost: 0.00008,
  },
  brass: {
    name: "Brass",
    density: 8500,
    color: "#B5A642",
    finish: "metallic",
    cost: 0.0003,
  },
};
