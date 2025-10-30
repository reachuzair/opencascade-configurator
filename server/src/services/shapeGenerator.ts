/**
 * M3: Multi-shape generator
 * Generates geometry data for different shape types
 */

import {
  Shape,
  BoxShape,
  CylinderShape,
  ConeShape,
  SphereShape,
} from "../types/shapes";

export interface ShapeGeometry {
  vertices: number[][];
  faces: number[][];
  edges: number[][];
  volume: number; // mm³
  surfaceArea: number; // mm²
  weight?: number; // grams
}

export function generateShape(shape: Shape): ShapeGeometry {
  switch (shape.type) {
    case "box":
      return generateBox(shape);
    case "cylinder":
      return generateCylinder(shape);
    case "cone":
      return generateCone(shape);
    case "sphere":
      return generateSphere(shape);
    default:
      throw new Error(`Unknown shape type`);
  }
}

function generateBox(shape: BoxShape): ShapeGeometry {
  const { width, height, depth } = shape;
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;

  const vertices = [
    [-w, -h, -d],
    [w, -h, -d],
    [w, h, -d],
    [-w, h, -d],
    [-w, -h, d],
    [w, -h, d],
    [w, h, d],
    [-w, h, d],
  ];

  const faces = [
    [0, 1, 2, 3], // back
    [4, 5, 6, 7], // front
    [0, 1, 5, 4], // bottom
    [2, 3, 7, 6], // top
    [0, 3, 7, 4], // left
    [1, 2, 6, 5], // right
  ];

  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  const volume = width * height * depth;
  const surfaceArea = 2 * (width * height + width * depth + height * depth);
  const weight = shape.material
    ? (volume / 1000000) * shape.material.density // mm³ to m³ * kg/m³ * 1000 g/kg
    : undefined;

  return { vertices, faces, edges, volume, surfaceArea, weight };
}

function generateCylinder(shape: CylinderShape): ShapeGeometry {
  const { radius, height } = shape;
  const segments = 32;
  const vertices: number[][] = [];
  const faces: number[][] = [];
  const edges: number[][] = [];

  // Top circle
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([
      Math.cos(angle) * radius,
      height / 2,
      Math.sin(angle) * radius,
    ]);
  }

  // Bottom circle
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([
      Math.cos(angle) * radius,
      -height / 2,
      Math.sin(angle) * radius,
    ]);
  }

  // Center points
  vertices.push([0, height / 2, 0]); // top center
  vertices.push([0, -height / 2, 0]); // bottom center

  // Faces
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    faces.push([i, next, next + segments, i + segments]); // side face
    faces.push([i, next, segments * 2]); // top face
    faces.push([i + segments, next + segments, segments * 2 + 1]); // bottom face
  }

  // Edges
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    edges.push([i, next]); // top circle
    edges.push([i + segments, next + segments]); // bottom circle
    edges.push([i, i + segments]); // vertical
  }

  const volume = Math.PI * radius * radius * height;
  const surfaceArea = 2 * Math.PI * radius * (radius + height);
  const weight = shape.material
    ? (volume / 1000000) * shape.material.density
    : undefined;

  return { vertices, faces, edges, volume, surfaceArea, weight };
}

function generateCone(shape: ConeShape): ShapeGeometry {
  const { radius, height } = shape;
  const segments = 32;
  const vertices: number[][] = [];
  const faces: number[][] = [];
  const edges: number[][] = [];

  // Base circle
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([
      Math.cos(angle) * radius,
      -height / 2,
      Math.sin(angle) * radius,
    ]);
  }

  // Apex
  vertices.push([0, height / 2, 0]);

  // Base center
  vertices.push([0, -height / 2, 0]);

  // Faces
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    faces.push([i, next, segments]); // side face
    faces.push([i, next, segments + 1]); // base face
  }

  // Edges
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    edges.push([i, next]); // base circle
    edges.push([i, segments]); // to apex
  }

  const volume = (Math.PI * radius * radius * height) / 3;
  const slantHeight = Math.sqrt(radius * radius + height * height);
  const surfaceArea = Math.PI * radius * (radius + slantHeight);
  const weight = shape.material
    ? (volume / 1000000) * shape.material.density
    : undefined;

  return { vertices, faces, edges, volume, surfaceArea, weight };
}

function generateSphere(shape: SphereShape): ShapeGeometry {
  const { radius } = shape;
  const segments = 16;
  const rings = 16;
  const vertices: number[][] = [];
  const faces: number[][] = [];
  const edges: number[][] = [];

  // Generate vertices
  for (let i = 0; i <= rings; i++) {
    const phi = (i / rings) * Math.PI;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      vertices.push([x, y, z]);
    }
  }

  // Generate faces
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      faces.push([a, b, b + 1, a + 1]);
    }
  }

  // Generate edges (simplified)
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + segments + 1;
      edges.push([a, a + 1]);
      edges.push([a, b]);
    }
  }

  const volume = (4 / 3) * Math.PI * radius * radius * radius;
  const surfaceArea = 4 * Math.PI * radius * radius;
  const weight = shape.material
    ? (volume / 1000000) * shape.material.density
    : undefined;

  return { vertices, faces, edges, volume, surfaceArea, weight };
}
