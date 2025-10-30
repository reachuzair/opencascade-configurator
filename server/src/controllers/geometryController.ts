import { Request, Response } from "express";
import * as openCascadeService from "../services/openCascadeService";
import {
  generateBoxModel,
  exportToDXF,
  exportToPDF,
} from "../services/modelService";
import Configuration from "../models/Configuration";
import fs from "fs/promises";

/**
 * Geometry Controller
 * Handles API requests for model generation and export
 */

/**
 * Test endpoint
 */
export async function testEndpoint(req: Request, res: Response) {
  try {
    const hasPythonOCC = await openCascadeService.checkPythonOCC();

    res.json({
      success: true,
      message: "Backend server is running",
      pythonOCC: hasPythonOCC ? "Available" : "Not available (using fallback)",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Generate parametric model
 * POST /api/v1/geometry/generate
 */
import { generateShape } from "../services/shapeGenerator";
import { Shape } from "../types/shapes";

export async function generateModel(req: Request, res: Response) {
  try {
    const { shape, name, saveConfig } = req.body;

    // Validation
    if (!shape || !shape.type) {
      return res.status(400).json({
        success: false,
        error: "Missing shape parameter",
      });
    }

    // Validate shape-specific parameters
    if (shape.type === "box") {
      if (!shape.width || !shape.height || !shape.depth) {
        return res.status(400).json({
          success: false,
          error: "Box requires width, height, depth",
        });
      }
      if (shape.width <= 0 || shape.height <= 0 || shape.depth <= 0) {
        return res.status(400).json({
          success: false,
          error: "Dimensions must be positive",
        });
      }
    } else if (shape.type === "cylinder" || shape.type === "cone") {
      if (!shape.radius || !shape.height) {
        return res.status(400).json({
          success: false,
          error: `${shape.type} requires radius and height`,
        });
      }
      if (shape.radius <= 0 || shape.height <= 0) {
        return res.status(400).json({
          success: false,
          error: "Dimensions must be positive",
        });
      }
    } else if (shape.type === "sphere") {
      if (!shape.radius) {
        return res.status(400).json({
          success: false,
          error: "Sphere requires radius",
        });
      }
      if (shape.radius <= 0) {
        return res.status(400).json({
          success: false,
          error: "Radius must be positive",
        });
      }
    }

    const shapeData: Shape = shape;
    const modelData = generateShape(shapeData);

    // Save configuration to database if requested
    if (saveConfig && name) {
      try {
        await Configuration.create({
          name,
          modelType: shape.type,
          parameters: shape,
        });
        console.log(`📝 Configuration saved: ${name}`);
      } catch (dbError) {
        console.warn("⚠️ Failed to save configuration to database:", dbError);
        // Continue even if database save fails
      }
    }

    // For OpenCascade service, only use box for now
    const modelId = Date.now().toString();
    let result;
    if (shape.type === "box") {
      result = await openCascadeService.generateModel(
        { width: shape.width, height: shape.height, depth: shape.depth },
        modelId
      );
    } else {
      result = { success: true, message: "Generated with Three.js" };
    }

    if (result.success) {
      res.json({
        success: true,
        message: result.message || "Model generated successfully",
        model: modelData,
        files: {
          step: result.stepFile
            ? `/api/v1/geometry/download/${modelId}.step`
            : null,
          dxf: result.dxfFile
            ? `/api/v1/geometry/download/${modelId}.dxf`
            : null,
          stl: result.stlFile
            ? `/api/v1/geometry/download/${modelId}.stl`
            : null,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || "Failed to generate model",
      });
    }
  } catch (error) {
    console.error("Error in generateModel:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Export model to specific format
 * POST /api/v1/geometry/export/:format
 */
export async function exportModel(req: Request, res: Response) {
  try {
    const { format } = req.params;
    const { width, height, depth } = req.body;

    if (!width || !height || !depth) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: width, height, depth required",
      });
    }

    const modelId = Date.now().toString();

    switch (format) {
      case "step":
      case "stl":
        {
          // Use OpenCascade service for STEP/STL
          const filePath = await openCascadeService.exportModel(
            { width, height, depth },
            format,
            modelId
          );

          if (filePath) {
            const fileContent = await fs.readFile(filePath);
            res.setHeader("Content-Type", `application/${format}`);
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=model-${modelId}.${format}`
            );
            res.send(fileContent);
          } else {
            // Fallback to error message
            res.status(500).json({
              success: false,
              error: `${format.toUpperCase()} export not available. Install PythonOCC for full support.`,
            });
          }
        }
        break;

      case "dxf":
        {
          // Use Node.js service for DXF (2D drawings)
          const dxfContent = exportToDXF(width, height, depth);
          res.setHeader("Content-Type", "application/dxf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=model-${modelId}.dxf`
          );
          res.send(dxfContent);
        }
        break;

      case "pdf":
        {
          // Use Node.js service for PDF
          const pdfBuffer = exportToPDF(width, height, depth);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=model-${modelId}.pdf`
          );
          res.send(pdfBuffer);
        }
        break;

      default:
        res.status(400).json({
          success: false,
          error: `Unsupported format: ${format}. Supported: step, stl, dxf, pdf`,
        });
    }
  } catch (error) {
    console.error("Error in exportModel:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}

/**
 * Get all saved configurations
 * GET /api/v1/geometry/configurations
 */
export async function getConfigurations(req: Request, res: Response) {
  try {
    const configurations = await Configuration.findAll({
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    res.json({
      success: true,
      count: configurations.length,
      configurations,
    });
  } catch (error) {
    console.error("Error fetching configurations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch configurations",
    });
  }
}

/**
 * Get specific configuration
 * GET /api/v1/geometry/configurations/:id
 */
export async function getConfiguration(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const configuration = await Configuration.findByPk(id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: "Configuration not found",
      });
    }

    res.json({
      success: true,
      configuration,
    });
  } catch (error) {
    console.error("Error fetching configuration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch configuration",
    });
  }
}

/**
 * Delete configuration
 * DELETE /api/v1/geometry/configurations/:id
 */
export async function deleteConfiguration(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await Configuration.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: "Configuration not found",
      });
    }

    res.json({
      success: true,
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete configuration",
    });
  }
}
