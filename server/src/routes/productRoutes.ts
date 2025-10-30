import express from "express";
import * as productController from "../controllers/productController";
import {
  generateProductModel,
  getUserConfigurations,
} from "../services/productService";
import { Request, Response } from "express";

const router = express.Router();

// Product CRUD routes
router.get("/products", productController.listProducts);
router.get("/products/:id", productController.getProduct);
router.get("/products/:id/schema", productController.getProductSchema);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

// Model generation route
router.post("/products/:id/generate", async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { parameters, name } = req.body;

    if (!parameters) {
      return res.status(400).json({
        success: false,
        error: "Parameters are required",
      });
    }

    const result = await generateProductModel({
      productId,
      parameters,
      name,
      userId: undefined, // TODO: Get from auth
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error in generate route:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Configuration routes
router.get("/configurations", async (req: Request, res: Response) => {
  try {
    const configs = await getUserConfigurations();
    res.json({
      success: true,
      configurations: configs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch configurations",
    });
  }
});

export default router;
