/**
 * M2: Advanced DXF Drawing Engine
 * Generates AutoCAD-quality 2D drawings with layers, dimensions, and title blocks
 */

interface DrawingConfig {
  width: number;
  height: number;
  depth: number;
  modelName?: string;
  author?: string;
  date?: string;
  units?: string;
  scale?: number;
}

interface Layer {
  name: string;
  color: number;
  lineType: string;
}

class DXFEngine {
  private config: DrawingConfig;
  private layers: Layer[] = [
    { name: "DIMENSIONS", color: 1, lineType: "CONTINUOUS" },
    { name: "GEOMETRY", color: 7, lineType: "CONTINUOUS" },
    { name: "CENTERLINES", color: 4, lineType: "CENTER" },
    { name: "HIDDEN", color: 8, lineType: "HIDDEN" },
    { name: "TEXT", color: 3, lineType: "CONTINUOUS" },
    { name: "TITLEBLOCK", color: 2, lineType: "CONTINUOUS" },
  ];

  constructor(config: DrawingConfig) {
    this.config = {
      ...config,
      modelName: config.modelName || "Parametric Box",
      author: config.author || "Configurator",
      date: config.date || new Date().toISOString().split("T")[0],
      units: config.units || "mm",
      scale: config.scale || 1,
    };
  }

  generate(): string {
    let dxf = this.generateHeader();
    dxf += this.generateTables();
    dxf += this.generateBlocks();
    dxf += this.generateEntities();
    dxf += this.generateFooter();
    return dxf;
  }

  private generateHeader(): string {
    return `0
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
9
$MEASUREMENT
70
1
0
ENDSEC
`;
  }

  private generateTables(): string {
    let dxf = `0
SECTION
2
TABLES
0
TABLE
2
LTYPE
70
${this.layers.length}
`;

    // Line types
    dxf += `0
LTYPE
2
CONTINUOUS
70
0
3
Solid line
72
65
73
0
40
0.0
0
LTYPE
2
CENTER
70
0
3
Center ____ _ ____ _ ____ _ ____ _ ____ _
72
65
73
4
40
2.0
49
1.25
49
-0.25
49
0.25
49
-0.25
0
LTYPE
2
HIDDEN
70
0
3
Hidden __ __ __ __ __ __ __ __ __ __ __ __
72
65
73
2
40
0.375
49
0.25
49
-0.125
`;

    dxf += `0
ENDTAB
0
TABLE
2
LAYER
70
${this.layers.length}
`;

    // Layers
    this.layers.forEach((layer) => {
      dxf += `0
LAYER
2
${layer.name}
70
0
62
${layer.color}
6
${layer.lineType}
`;
    });

    dxf += `0
ENDTAB
0
ENDSEC
`;
    return dxf;
  }

  private generateBlocks(): string {
    return `0
SECTION
2
BLOCKS
0
ENDSEC
`;
  }

  private generateEntities(): string {
    let dxf = `0
SECTION
2
ENTITIES
`;

    // Title block (bottom right)
    dxf += this.drawTitleBlock();

    // Front view (top left)
    dxf += this.drawFrontView();

    // Top view (bottom left)
    dxf += this.drawTopView();

    // Side view (top right)
    dxf += this.drawSideView();

    // Isometric view hint
    dxf += this.drawIsometricGuide();

    dxf += `0
ENDSEC
`;
    return dxf;
  }

  private drawTitleBlock(): string {
    const x = 250;
    const y = -150;
    const w = 150;
    const h = 80;

    let dxf = "";

    // Border
    dxf += this.drawRectangle(x, y, w, h, "TITLEBLOCK");

    // Horizontal dividers
    dxf += this.drawLine(x, y + 20, x + w, y + 20, "TITLEBLOCK");
    dxf += this.drawLine(x, y + 40, x + w, y + 40, "TITLEBLOCK");
    dxf += this.drawLine(x, y + 60, x + w, y + 60, "TITLEBLOCK");

    // Vertical divider
    dxf += this.drawLine(x + 50, y, x + 50, y + 60, "TITLEBLOCK");

    // Text
    dxf += this.drawText("TITLE:", x + 5, y + h - 15, 3, "TEXT");
    dxf += this.drawText(this.config.modelName!, x + 55, y + h - 15, 4, "TEXT");

    dxf += this.drawText("AUTHOR:", x + 5, y + h - 35, 3, "TEXT");
    dxf += this.drawText(this.config.author!, x + 55, y + h - 35, 3, "TEXT");

    dxf += this.drawText("DATE:", x + 5, y + h - 55, 3, "TEXT");
    dxf += this.drawText(this.config.date!, x + 55, y + h - 55, 3, "TEXT");

    dxf += this.drawText("SCALE:", x + 5, y + h - 75, 3, "TEXT");
    dxf += this.drawText(
      `1:${this.config.scale}`,
      x + 55,
      y + h - 75,
      3,
      "TEXT"
    );

    return dxf;
  }

  private drawFrontView(): string {
    const { width, height } = this.config;
    const x = -width / 2;
    const y = height / 2 + 50;
    let dxf = "";

    // View label
    dxf += this.drawText("FRONT VIEW", x + width / 2 - 20, y + 20, 4, "TEXT");

    // Main rectangle
    dxf += this.drawRectangle(x, y - height, width, height, "GEOMETRY");

    // Centerlines
    dxf += this.drawLine(
      x + width / 2,
      y - height - 10,
      x + width / 2,
      y + 10,
      "CENTERLINES"
    );
    dxf += this.drawLine(
      x - 10,
      y - height / 2,
      x + width + 10,
      y - height / 2,
      "CENTERLINES"
    );

    // Dimensions
    dxf += this.drawHorizontalDimension(
      x,
      y - height - 30,
      width,
      `${width}`,
      "DIMENSIONS"
    );
    dxf += this.drawVerticalDimension(
      x - 30,
      y - height,
      height,
      `${height}`,
      "DIMENSIONS"
    );

    return dxf;
  }

  private drawTopView(): string {
    const { width, depth } = this.config;
    const x = -width / 2;
    const y = -50;
    let dxf = "";

    // View label
    dxf += this.drawText(
      "TOP VIEW",
      x + width / 2 - 15,
      y + depth + 20,
      4,
      "TEXT"
    );

    // Main rectangle
    dxf += this.drawRectangle(x, y, width, depth, "GEOMETRY");

    // Centerlines
    dxf += this.drawLine(
      x + width / 2,
      y - 10,
      x + width / 2,
      y + depth + 10,
      "CENTERLINES"
    );
    dxf += this.drawLine(
      x - 10,
      y + depth / 2,
      x + width + 10,
      y + depth / 2,
      "CENTERLINES"
    );

    // Dimensions
    dxf += this.drawHorizontalDimension(
      x,
      y - 30,
      width,
      `${width}`,
      "DIMENSIONS"
    );
    dxf += this.drawVerticalDimension(
      x + width + 20,
      y,
      depth,
      `${depth}`,
      "DIMENSIONS"
    );

    return dxf;
  }

  private drawSideView(): string {
    const { depth, height } = this.config;
    const x = 150;
    const y = height / 2 + 50;
    let dxf = "";

    // View label
    dxf += this.drawText("SIDE VIEW", x + depth / 2 - 15, y + 20, 4, "TEXT");

    // Main rectangle
    dxf += this.drawRectangle(x, y - height, depth, height, "GEOMETRY");

    // Centerlines
    dxf += this.drawLine(
      x + depth / 2,
      y - height - 10,
      x + depth / 2,
      y + 10,
      "CENTERLINES"
    );
    dxf += this.drawLine(
      x - 10,
      y - height / 2,
      x + depth + 10,
      y - height / 2,
      "CENTERLINES"
    );

    // Dimensions
    dxf += this.drawHorizontalDimension(
      x,
      y - height - 30,
      depth,
      `${depth}`,
      "DIMENSIONS"
    );

    return dxf;
  }

  private drawIsometricGuide(): string {
    const x = 150;
    const y = -50;
    let dxf = "";

    dxf += this.drawText("3D VIEW:", x, y - 20, 3, "TEXT");
    dxf += this.drawText("See web interface", x, y - 30, 2.5, "TEXT");
    dxf += this.drawText("for interactive 3D", x, y - 38, 2.5, "TEXT");

    return dxf;
  }

  private drawRectangle(
    x: number,
    y: number,
    w: number,
    h: number,
    layer: string
  ): string {
    let dxf = "";
    dxf += this.drawLine(x, y, x + w, y, layer);
    dxf += this.drawLine(x + w, y, x + w, y + h, layer);
    dxf += this.drawLine(x + w, y + h, x, y + h, layer);
    dxf += this.drawLine(x, y + h, x, y, layer);
    return dxf;
  }

  private drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    layer: string
  ): string {
    return `0
LINE
8
${layer}
10
${x1.toFixed(3)}
20
${y1.toFixed(3)}
30
0.0
11
${x2.toFixed(3)}
21
${y2.toFixed(3)}
31
0.0
`;
  }

  private drawText(
    text: string,
    x: number,
    y: number,
    height: number,
    layer: string
  ): string {
    return `0
TEXT
8
${layer}
10
${x.toFixed(3)}
20
${y.toFixed(3)}
30
0.0
40
${height}
1
${text}
`;
  }

  private drawHorizontalDimension(
    x: number,
    y: number,
    length: number,
    text: string,
    layer: string
  ): string {
    let dxf = "";

    // Dimension line
    dxf += this.drawLine(x, y, x + length, y, layer);

    // Extension lines
    dxf += this.drawLine(x, y - 5, x, y + 5, layer);
    dxf += this.drawLine(x + length, y - 5, x + length, y + 5, layer);

    // Arrows (simple lines)
    dxf += this.drawLine(x, y, x + 5, y + 2, layer);
    dxf += this.drawLine(x, y, x + 5, y - 2, layer);
    dxf += this.drawLine(x + length, y, x + length - 5, y + 2, layer);
    dxf += this.drawLine(x + length, y, x + length - 5, y - 2, layer);

    // Text
    dxf += this.drawText(text, x + length / 2 - 5, y + 3, 2.5, layer);

    return dxf;
  }

  private drawVerticalDimension(
    x: number,
    y: number,
    length: number,
    text: string,
    layer: string
  ): string {
    let dxf = "";

    // Dimension line
    dxf += this.drawLine(x, y, x, y + length, layer);

    // Extension lines
    dxf += this.drawLine(x - 5, y, x + 5, y, layer);
    dxf += this.drawLine(x - 5, y + length, x + 5, y + length, layer);

    // Arrows
    dxf += this.drawLine(x, y, x + 2, y + 5, layer);
    dxf += this.drawLine(x, y, x - 2, y + 5, layer);
    dxf += this.drawLine(x, y + length, x + 2, y + length - 5, layer);
    dxf += this.drawLine(x, y + length, x - 2, y + length - 5, layer);

    // Text (rotated 90 degrees conceptually)
    dxf += this.drawText(text, x + 5, y + length / 2, 2.5, layer);

    return dxf;
  }

  private generateFooter(): string {
    return `0
EOF
`;
  }
}

export function generateEngineeringDrawing(config: DrawingConfig): string {
  const engine = new DXFEngine(config);
  return engine.generate();
}
