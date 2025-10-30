import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * List all active products
 */
export async function listProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        thumbnailUrl: true,
        parametersSchema: true,
      },
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
}

/**
 * Get single product by ID
 */
export async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
}

/**
 * Get product parameter schema
 */
export async function getProductSchema(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        parametersSchema: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json(product.parametersSchema);
  } catch (error) {
    console.error("Error fetching product schema:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product schema",
    });
  }
}

/**
 * Create new product (admin only)
 */
export async function createProduct(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      category,
      scriptName,
      parametersSchema,
      thumbnailUrl,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        scriptName,
        parametersSchema,
        thumbnailUrl,
      },
    });

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product",
    });
  }
}

/**
 * Update product (admin only)
 */
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      scriptName,
      parametersSchema,
      thumbnailUrl,
      isActive,
    } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        scriptName,
        parametersSchema,
        thumbnailUrl,
        isActive,
      },
    });

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product",
    });
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
}
