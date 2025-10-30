import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import geometryRoutes from "./routes/geometryRoutes";
import productRoutes from "./routes/productRoutes";
import prisma from "./lib/prisma";
import { checkPythonOCC } from "./services/openCascadeService";
import path from "path";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ===========================
// Middleware Configuration
// ===========================

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ===========================
// Routes
// ===========================

// Serve generated CAD files (STEP/STL/DXF/PDF)
const filesDir = path.join(__dirname, "../../python-api/output");
app.use("/files", express.static(filesDir));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Legacy endpoints for backward compatibility
app.post("/api/generate-model", async (req: Request, res: Response) => {
  const { generateBoxModel } = await import("./services/modelService");
  try {
    const { width, height, depth } = req.body;

    if (!width || !height || !depth) {
      return res.status(400).json({
        error: "Missing parameters: width, height, depth required",
      });
    }

    const model = generateBoxModel(width, height, depth);
    res.json(model);
  } catch (error) {
    console.error("Error generating model:", error);
    res.status(500).json({ error: "Failed to generate model" });
  }
});

app.post("/api/export/dxf", async (req: Request, res: Response) => {
  const { exportToDXF } = await import("./services/modelService");
  try {
    const { width, height, depth } = req.body;

    if (!width || !height || !depth) {
      return res.status(400).json({
        error: "Missing parameters: width, height, depth required",
      });
    }

    const dxfContent = exportToDXF(width, height, depth);
    res.setHeader("Content-Type", "application/dxf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=model-${Date.now()}.dxf`
    );
    res.send(dxfContent);
  } catch (error) {
    console.error("Error exporting to DXF:", error);
    res.status(500).json({ error: "Failed to export to DXF" });
  }
});

app.post("/api/export/pdf", async (req: Request, res: Response) => {
  const { exportToPDF } = await import("./services/modelService");
  try {
    const { width, height, depth } = req.body;

    if (!width || !height || !depth) {
      return res.status(400).json({
        error: "Missing parameters: width, height, depth required",
      });
    }

    const pdfBuffer = exportToPDF(width, height, depth);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=model-${Date.now()}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    res.status(500).json({ error: "Failed to export to PDF" });
  }
});

// Mount geometry routes (new API v1)
app.use("/api/v1/geometry", geometryRoutes);

// Mount product routes
app.use("/api/v1", productRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// ===========================
// Server Initialization
// ===========================

async function startServer() {
  console.log("");
  console.log("=".repeat(60));
  console.log("🚀 Open Cascade Configurator - Backend Server");
  console.log("=".repeat(60));
  console.log("");

  // Check database connection
  console.log("📊 Checking database connection...");
  let dbConnected = false;
  try {
    await prisma.$connect();
    console.log("✅ Prisma database connection established successfully.");
    dbConnected = true;
  } catch (error) {
    console.warn("⚠️  Database not available. Running without persistence.");
    console.warn("   Configure DATABASE_URL in .env file");
    dbConnected = false;
  }

  // Check PythonOCC availability
  console.log("");
  console.log("🐍 Checking PythonOCC installation...");
  const hasPythonOCC = await checkPythonOCC();

  if (!hasPythonOCC) {
    console.log("");
    console.log("💡 To enable full CAD capabilities, install PythonOCC:");
    console.log("   pip install pythonocc-core");
    console.log("");
  }

  // Start server
  app.listen(PORT, () => {
    console.log("");
    console.log("=".repeat(60));
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("=".repeat(60));
    console.log("");
    console.log("📡 API Endpoints:");
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/products`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/products/:id`);
    console.log(
      `   POST http://localhost:${PORT}/api/v1/products/:id/generate`
    );
    console.log(`   GET  http://localhost:${PORT}/api/v1/configurations`);
    console.log("");
    console.log("🔧 Legacy Endpoints (backward compatible):");
    console.log(`   POST http://localhost:${PORT}/api/generate-model`);
    console.log(`   POST http://localhost:${PORT}/api/export/dxf`);
    console.log(`   POST http://localhost:${PORT}/api/export/pdf`);
    console.log("");
    console.log("🌐 Environment:", process.env.NODE_ENV || "development");
    console.log("📦 Database:", dbConnected ? "Connected" : "Not configured");
    console.log("🔧 PythonOCC:", hasPythonOCC ? "Available" : "Not available");
    console.log("");
    console.log("=".repeat(60));
  });
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

export default app;
