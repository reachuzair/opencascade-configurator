/**
 * Model Service - Handles parametric model generation and export
 * M1 POC: Simple parametric box model
 */

interface BoxModel {
  vertices: number[][];
  faces: number[][];
  edges: number[][];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

/**
 * Generate a parametric box model
 * @param width - Width of the box
 * @param height - Height of the box
 * @param depth - Depth of the box
 * @returns BoxModel object with vertices, faces, and edges
 */
export function generateBoxModel(
  width: number,
  height: number,
  depth: number
): BoxModel {
  // Define 8 vertices of a box centered at origin
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;

  const vertices = [
    [-w, -h, -d], // 0: bottom-left-back
    [w, -h, -d], // 1: bottom-right-back
    [w, h, -d], // 2: top-right-back
    [-w, h, -d], // 3: top-left-back
    [-w, -h, d], // 4: bottom-left-front
    [w, -h, d], // 5: bottom-right-front
    [w, h, d], // 6: top-right-front
    [-w, h, d], // 7: top-left-front
  ];

  // Define 6 faces (each face has 4 vertices in counter-clockwise order)
  const faces = [
    [0, 1, 2, 3], // back
    [4, 5, 6, 7], // front
    [0, 1, 5, 4], // bottom
    [2, 3, 7, 6], // top
    [0, 3, 7, 4], // left
    [1, 2, 6, 5], // right
  ];

  // Define 12 edges
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0], // back face
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4], // front face
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7], // connecting edges
  ];

  return {
    vertices,
    faces,
    edges,
    dimensions: { width, height, depth },
  };
}

import { generateEngineeringDrawing } from "./dxfEngine";

/**
 * Export model to DXF format - M2 Enhanced Version
 * Generates 2D orthogonal views with layers, dimensions, and title blocks
 */
export function exportToDXF(
  width: number,
  height: number,
  depth: number,
  modelName?: string
): string {
  // Use new M2 DXF engine
  return generateEngineeringDrawing({
    width,
    height,
    depth,
    modelName,
    author: "Web Configurator",
    units: "mm",
    scale: 1,
  });
}

/**
 * Legacy DXF export (basic version)
 */
export function exportToDXFLegacy(
  width: number,
  height: number,
  depth: number
): string {
  const model = generateBoxModel(width, height, depth);

  // DXF header
  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
4
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  // Front view (X-Y plane) - offset to x=0
  const frontViewOffset = { x: 0, y: 0 };
  dxf += generateRectangle(
    frontViewOffset.x - width / 2,
    frontViewOffset.y - height / 2,
    width,
    height,
    "Front View"
  );

  // Top view (X-Z plane) - offset to y = -height - 50
  const topViewOffset = { x: 0, y: -height - 50 };
  dxf += generateRectangle(
    topViewOffset.x - width / 2,
    topViewOffset.y - depth / 2,
    width,
    depth,
    "Top View"
  );

  // Side view (Z-Y plane) - offset to x = width + 50
  const sideViewOffset = { x: width + 50, y: 0 };
  dxf += generateRectangle(
    sideViewOffset.x - depth / 2,
    sideViewOffset.y - height / 2,
    depth,
    height,
    "Side View"
  );

  // Add dimension annotations
  dxf += generateText(
    `W: ${width}`,
    frontViewOffset.x,
    frontViewOffset.y + height / 2 + 10
  );
  dxf += generateText(
    `H: ${height}`,
    frontViewOffset.x - width / 2 - 20,
    frontViewOffset.y
  );
  dxf += generateText(
    `D: ${depth}`,
    topViewOffset.x,
    topViewOffset.y + depth / 2 + 10
  );

  // DXF footer
  dxf += `0
ENDSEC
0
EOF
`;

  return dxf;
}

/**
 * Helper function to generate a rectangle in DXF format
 */
function generateRectangle(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string
): string {
  let dxf = "";

  // Add label
  dxf += generateText(label, x + w / 2, y + h + 5);

  // Draw rectangle using LINE entities
  const corners = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y], // close the rectangle
  ];

  for (let i = 0; i < corners.length - 1; i++) {
    dxf += `0
LINE
8
0
10
${corners[i][0]}
20
${corners[i][1]}
30
0.0
11
${corners[i + 1][0]}
21
${corners[i + 1][1]}
31
0.0
`;
  }

  return dxf;
}

/**
 * Helper function to add text in DXF format
 */
function generateText(text: string, x: number, y: number): string {
  return `0
TEXT
8
0
10
${x}
20
${y}
30
0.0
40
5.0
1
${text}
`;
}

/**
 * Export model to PDF format
 * Creates a simple technical drawing with dimensions
 */
export function exportToPDF(
  width: number,
  height: number,
  depth: number
): Buffer {
  // For M1 POC, we'll create a simple PDF representation
  // In production, you'd use a library like PDFKit or similar

  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 400
>>
stream
BT
/F1 24 Tf
50 750 Td
(Parametric Box Model) Tj
ET
BT
/F1 12 Tf
50 700 Td
(Technical Drawing - M1 POC) Tj
ET
BT
/F1 12 Tf
50 650 Td
(Dimensions:) Tj
ET
BT
/F1 10 Tf
70 630 Td
(Width: ${width} mm) Tj
ET
BT
/F1 10 Tf
70 610 Td
(Height: ${height} mm) Tj
ET
BT
/F1 10 Tf
70 590 Td
(Depth: ${depth} mm) Tj
ET
BT
/F1 10 Tf
50 550 Td
(Volume: ${(width * height * depth).toFixed(2)} mm^3) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
0000000724 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
812
%%EOF
`;

  return Buffer.from(pdfContent);
}
