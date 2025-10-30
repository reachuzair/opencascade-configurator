# Open Cascade Configurator

A web-based parametric CAD configurator using **Open Cascade** to generate 3D models and engineering drawings from user inputs.

## 🎯 Project Overview

An online CAD tool that allows users to configure mechanical parts by inputting parameters (dimensions, shapes, materials, etc.) and instantly:

- ✅ **3D Preview**: Interactive Three.js viewer with orbit controls
- ✅ **3D Export**: STEP, STL, BREP file generation
- ✅ **Parametric Models**: Box, Cylinder, Cone, Sphere, Bottle
- ⚠️ **2D Drawings**: DXF placeholder (HLR not implemented)
- ❌ **PDF Export**: Not yet implemented

> **📊 Project Status**: See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed milestone completion (~40% complete)

## 📋 Current Implementation Status

**What's Working:**
- ✅ 5 parametric models (Box, Cylinder, Cone, Sphere, Bottle)
- ✅ PythonOCC CAD generation
- ✅ 3D visualization with Three.js + React Three Fiber
- ✅ STEP/STL/BREP export
- ✅ Dynamic product catalog
- ✅ Configuration storage with revisions
- ✅ Full-stack integration (React + Node + Python + PostgreSQL)

**What's Missing:**
- ❌ Real DXF generation (HLR algorithm)
- ❌ Multi-view 2D drawings
- ❌ PDF export
- ❌ Azure deployment
- ❌ MS SQL Server integration

## 🏗️ Architecture

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   React     │ HTTP  │   Node.js    │ spawn │  PythonOCC  │
│  Frontend   │──────▶│   Backend    │──────▶│  CAD Engine │
│ (Three.js)  │◀──────│   (Express)  │◀──────│             │
└─────────────┘ JSON  └──────────────┘ JSON  └─────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      │   (Prisma)   │
                      └──────────────┘
```

**Tech Stack:**
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS + Three.js
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **CAD Engine**: PythonOCC (via Conda)
- **Database**: PostgreSQL (Neon)
- **File Storage**: Local filesystem (generated CAD files)

## 🚀 Quick Start

See [QUICK_START.md](QUICK_START.md) for full setup instructions.

**TL;DR:**
```bash
# 1. Install PythonOCC
conda create -n opencascade python=3.10 -y
conda activate opencascade
conda install -c conda-forge pythonocc-core -y

# 2. Start Backend
cd server
npm install
npm run dev

# 3. Start Frontend
cd frontend
npm install
npm run dev

# 4. Open http://localhost:3000
```

## 📖 Features

### Current Implementation
- **Dynamic Product Catalog**: Browse and select from multiple parametric models
- **Real-time 3D Preview**: Interactive Three.js viewer with orbit controls
- **Parameter Configuration**: Adjust dimensions with sliders and real-time validation
- **CAD File Export**: Download STEP, STL, and BREP files
- **Configuration Management**: Save and load configurations with revision tracking
- **Database Storage**: PostgreSQL with Prisma ORM for persistence

### Export Formats
- ✅ **STEP**: Standard CAD format for professional use
- ✅ **STL**: 3D printing and mesh visualization
- ✅ **BREP**: Native OCCT boundary representation
- ⚠️ **DXF**: Placeholder only (no HLR implementation)
- ❌ **PDF**: Not yet implemented

## 📖 Usage

1. Open `http://localhost:3000`
2. Click on a product card (Bottle, Box, Cylinder, etc.)
3. Switch to "Configurator" tab
4. Adjust parameters using sliders
5. Click "🚀 Generate Model"
6. View 3D preview and download STEP/STL files

**Mouse Controls:**
- **Left drag**: Rotate model
- **Scroll**: Zoom in/out
- **Right drag**: Pan view

## 🗺️ Roadmap & Status

> **See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed milestone analysis**

| Milestone | Target | Status | Completion |
|-----------|--------|--------|------------|
| **M1**: Proof of Concept | 2 weeks | ⚠️ Partial | 75% |
| **M2**: Drawing Engine | 3 weeks | ❌ Not Started | 0% |
| **M3**: Full Configurator | 3 weeks | ⚠️ Partial | 80% |
| **M4**: Azure Deployment | 2 weeks | ❌ Not Started | 0% |
| **Overall** | | | **~40%** |

### Critical Missing Features:
1. **Hidden Line Removal (HLR)** for real DXF generation
2. **Multi-view 2D drawings** with dimensions and title blocks
3. **PDF export** for technical documentation
4. **Azure deployment** with MS SQL Server
5. **Production containerization**

## 🛠️ Project Structure

```
open-cascade-configurator/
├── frontend/              # React + Next.js + Three.js
│   ├── app/              # Next.js pages and routes
│   ├── components/       # React components (3D viewer, UI)
│   └── lib/              # API client and utilities
│
├── server/               # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── app.ts       # Express server setup
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   └── prisma/          # Database schema and migrations
│
└── python-api/          # PythonOCC CAD engine
    ├── core/            # Export utilities
    └── products/        # Product generators (box, bottle, etc.)
```

## 📚 Documentation

- **[README.md](README.md)** - This file (project overview)
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Original scope vs current implementation
- **[QUICK_START.md](QUICK_START.md)** - Setup and installation guide

## 🐛 Troubleshooting

**Backend not starting?**
- Check `PYTHON_PATH` in `server/.env`
- Verify conda environment: `conda activate opencascade && which python`

**Model generation failing?**
- Check backend terminal for Python errors
- Test PythonOCC: `python python-api/test_occt.py`

**Database issues?**
- Verify `DATABASE_URL` in `server/.env`
- Run migrations: `cd server && npx prisma migrate dev`

## 📄 License

Proprietary - All rights reserved

---

**Built with React, Three.js, Node.js, and PythonOCC**

