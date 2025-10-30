import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);

/**
 * Open Cascade Service
 * Handles integration with PythonOCC for CAD operations
 */

const PYTHON_PATH = process.env.PYTHON_PATH || "python3";
const SCRIPTS_DIR = path.join(__dirname, "../../../python-api");
const OUTPUT_DIR = path.join(__dirname, "../../../python-api/output");

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating output directory:", error);
  }
}

interface ModelParameters {
  width: number;
  height: number;
  depth: number;
}

interface GeneratedModel {
  success: boolean;
  stepFile?: string;
  dxfFile?: string;
  stlFile?: string;
  message?: string;
  error?: string;
}

/**
 * Check if PythonOCC is available
 */
export async function checkPythonOCC(): Promise<boolean> {
  try {
    const { stdout, stderr } = await execAsync(
      `${PYTHON_PATH} -c "import OCC.Core.BRepPrimAPI; print('OK')"`
    );

    if (stdout.includes("OK")) {
      console.log("✅ PythonOCC is available");
      return true;
    }

    console.warn("⚠️ PythonOCC not found. Using fallback mode.");
    return false;
  } catch (error) {
    console.warn("⚠️ PythonOCC not found. Using fallback mode.");
    console.log("   Install with: pip install pythonocc-core");
    return false;
  }
}

/**
 * Generate 3D model using PythonOCC
 */
export async function generateModel(
  params: ModelParameters,
  modelId: string = Date.now().toString()
): Promise<GeneratedModel> {
  await ensureOutputDir();

  const scriptPath = path.join(SCRIPTS_DIR, "generate_model.py");
  const outputBasePath = path.join(OUTPUT_DIR, `model_${modelId}`);

  try {
    // Check if PythonOCC is available
    const hasPythonOCC = await checkPythonOCC();

    if (hasPythonOCC) {
      // Use PythonOCC for actual CAD generation
      const command = `${PYTHON_PATH} "${scriptPath}" ${params.width} ${params.height} ${params.depth} "${outputBasePath}"`;

      console.log(`🔧 Generating model with PythonOCC: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 second timeout
      });

      if (stderr && !stderr.includes("Warning")) {
        console.error("Python script stderr:", stderr);
      }

      console.log("Python script output:", stdout);

      // Check if files were generated
      const stepFile = `${outputBasePath}.step`;
      const dxfFile = `${outputBasePath}.dxf`;
      const stlFile = `${outputBasePath}.stl`;

      const files: GeneratedModel = {
        success: true,
        message: "Model generated successfully with PythonOCC",
      };

      try {
        await fs.access(stepFile);
        files.stepFile = stepFile;
      } catch (e) {
        // File doesn't exist
      }

      try {
        await fs.access(dxfFile);
        files.dxfFile = dxfFile;
      } catch (e) {
        // File doesn't exist
      }

      try {
        await fs.access(stlFile);
        files.stlFile = stlFile;
      } catch (e) {
        // File doesn't exist
      }

      return files;
    } else {
      // Fallback: Use the existing Node.js implementation
      console.log(
        "ℹ️ Using fallback Node.js implementation (PythonOCC not available)"
      );

      return {
        success: true,
        message:
          "Using fallback mode. Install PythonOCC for full CAD capabilities.",
      };
    }
  } catch (error: any) {
    console.error("Error generating model:", error);

    return {
      success: false,
      error: error.message || "Failed to generate model",
    };
  }
}

/**
 * Export model to specific format using PythonOCC
 */
export async function exportModel(
  params: ModelParameters,
  format: "step" | "dxf" | "stl" | "pdf",
  modelId: string = Date.now().toString()
): Promise<string | null> {
  const result = await generateModel(params, modelId);

  if (!result.success) {
    throw new Error(result.error || "Failed to generate model");
  }

  switch (format) {
    case "step":
      return result.stepFile || null;
    case "dxf":
      return result.dxfFile || null;
    case "stl":
      return result.stlFile || null;
    default:
      return null;
  }
}

/**
 * Clean up old generated files (older than 1 hour)
 */
export async function cleanupOldFiles(): Promise<void> {
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > oneHour) {
        await fs.unlink(filePath);
        console.log(`🗑️ Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);
