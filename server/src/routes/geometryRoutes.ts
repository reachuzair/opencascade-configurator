import { Router } from "express";
import * as geometryController from "../controllers/geometryController";

const router = Router();

/**
 * Geometry API Routes
 * Base path: /api/v1/geometry
 */

// Test endpoint
router.get("/test", geometryController.testEndpoint);

// Model generation
router.post("/generate", geometryController.generateModel);

// Export endpoints
router.post("/export/:format", geometryController.exportModel);

// Configuration management
router.get("/configurations", geometryController.getConfigurations);
router.get("/configurations/:id", geometryController.getConfiguration);
router.delete("/configurations/:id", geometryController.deleteConfiguration);

export default router;
