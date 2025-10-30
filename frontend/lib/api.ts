// API client for interacting with the backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  parametersSchema: any;
}

export interface Configuration {
  id: number;
  name: string;
  modelType: string;
  parameters: Record<string, any>;
  stepFile?: string;
  stlFile?: string;
  dxfFile?: string;
  pdfFile?: string;
  createdAt: string;
  product?: {
    name: string;
    category: string;
  };
}

export interface GenerateModelResponse {
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

// Products API
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/v1/products`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.products || [];
}

export async function fetchProduct(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/v1/products/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  const data = await response.json();
  return data.product;
}

export async function generateProductModel(
  productId: number,
  parameters: Record<string, any>,
  name?: string
): Promise<GenerateModelResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/products/${productId}/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parameters, name }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate model");
  }

  return response.json();
}

// Configurations API
export async function fetchConfigurations(): Promise<Configuration[]> {
  const response = await fetch(`${API_BASE_URL}/v1/configurations`);
  if (!response.ok) {
    throw new Error("Failed to fetch configurations");
  }
  const data = await response.json();
  return data.configurations || [];
}

// Legacy API (for backward compatibility)
export async function generateModel(
  width: number,
  height: number,
  depth: number
) {
  const response = await fetch(`${API_BASE_URL}/generate-model`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ width, height, depth }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate model");
  }

  return response.json();
}

export async function exportDXF(
  width: number,
  height: number,
  depth: number
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/dxf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ width, height, depth }),
  });

  if (!response.ok) {
    throw new Error("Failed to export DXF");
  }

  return response.blob();
}

export async function exportPDF(
  width: number,
  height: number,
  depth: number
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ width, height, depth }),
  });

  if (!response.ok) {
    throw new Error("Failed to export PDF");
  }

  return response.blob();
}
