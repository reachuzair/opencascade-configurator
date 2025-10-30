import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import prisma from "../lib/prisma";

interface GenerateModelParams {
  productId: number;
  parameters: Record<string, any>;
  userId?: number;
  name?: string;
}

interface GenerateModelResult {
  success: boolean;
  files?: {
    step: string | null;
    stl: string | null;
    dxf: string | null;
    pdf: string | null;
  };
  preview?: any;
  configId?: number;
  error?: string;
}

/**
 * Validate parameters against product schema
 */
function validateParameters(
  parameters: Record<string, any>,
  schema: any
): boolean {
  // Basic validation - check required fields
  if (!schema.parameters || !Array.isArray(schema.parameters)) {
    throw new Error("Invalid product schema");
  }

  for (const field of schema.parameters) {
    if (field.required && !(field.name in parameters)) {
      throw new Error(`Missing required parameter: ${field.name}`);
    }

    // Type validation
    if (parameters[field.name] !== undefined) {
      const value = parameters[field.name];

      if (field.type === "number") {
        if (typeof value !== "number") {
          throw new Error(`Parameter ${field.name} must be a number`);
        }
        if (field.min !== undefined && value < field.min) {
          throw new Error(`Parameter ${field.name} must be >= ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          throw new Error(`Parameter ${field.name} must be <= ${field.max}`);
        }
      }
    }
  }

  return true;
}

/**
 * Execute Python generator script
 */
async function executePythonGenerator(
  scriptName: string,
  parameters: Record<string, any>,
  modelId: string
): Promise<any> {
  const pythonPath = process.env.PYTHON_PATH || "python3";
  // Python scripts are in project root's python-api directory (not inside server/)
  const scriptPath = path.join(
    __dirname,
    `../../../python-api/products/${scriptName}`
  );
  const outputDir = path.join(__dirname, "../../../python-api/output");

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Build command
  const paramsJson = JSON.stringify(parameters).replace(/"/g, '\\"');
  const command = `"${pythonPath}" "${scriptPath}" --params "${paramsJson}" --output-dir "${outputDir}" --model-id "${modelId}"`;

  console.log(`Executing: ${command}`);

  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error("Python execution error:", stderr);
        reject(
          new Error(`Model generation failed: ${error.message}\n${stderr}`)
        );
        return;
      }

      if (stderr) {
        console.warn("Python stderr:", stderr);
      }

      try {
        // Python script outputs JSON on the last line
        // Extract the last non-empty line (ignore STEP writer output)
        const lines = stdout.trim().split("\n");
        const jsonLine = lines[lines.length - 1];

        const result = JSON.parse(jsonLine);
        resolve(result);
      } catch (e) {
        console.error("Failed to parse Python output:", stdout);
        reject(new Error("Invalid response from Python script"));
      }
    });
  });
}

/**
 * Generate product model with PythonOCC
 */
export async function generateProductModel(
  params: GenerateModelParams
): Promise<GenerateModelResult> {
  try {
    const { productId, parameters, userId, name } = params;

    // 1. Get product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // 2. Validate parameters against schema
    validateParameters(parameters, product.parametersSchema);

    // 3. Generate unique model ID
    const timestamp = Date.now();
    const modelId = `${product.scriptName.split(".")[0]}_${timestamp}`;

    // 4. Execute Python script
    console.log(`Generating model for product: ${product.name}`);
    const result = await executePythonGenerator(
      product.scriptName,
      parameters,
      modelId
    );

    if (!result.success) {
      throw new Error(result.error || "Model generation failed");
    }

    // 5. Save configuration to database
    const config = await prisma.configuration.create({
      data: {
        userId: userId || null,
        productId: product.id,
        name: name || `${product.name} ${modelId}`,
        modelType: product.scriptName.split(".")[0],
        parameters: parameters as any,
        stepFile: result.files?.step || null,
        stlFile: result.files?.stl || null,
        dxfFile: result.files?.dxf || null,
        pdfFile: result.files?.pdf || null,
      },
    });

    console.log(`✅ Configuration saved: ${config.name} (ID: ${config.id})`);

    // 6. Build public URLs for downloads served via /files
    const baseUrl =
      process.env.PUBLIC_BACKEND_URL ||
      `http://localhost:${process.env.PORT || 5000}`;
    const toUrl = (p?: string | null) =>
      p ? `${baseUrl}/files/${path.basename(p)}` : null;

    return {
      success: true,
      files: {
        step: toUrl(result.files?.step),
        stl: toUrl(result.files?.stl),
        dxf: toUrl(result.files?.dxf),
        pdf: toUrl(result.files?.pdf),
      },
      preview: result.preview,
      configId: config.id,
    };
  } catch (error) {
    console.error("Error in generateProductModel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user configurations
 */
export async function getUserConfigurations(userId?: number) {
  try {
    const configs = await prisma.configuration.findMany({
      where: userId ? { userId } : {},
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return configs;
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return [];
  }
}
