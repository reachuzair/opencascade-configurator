# Open Cascade Configurator

Web-based parametric CAD configurator that generates 3D models and exports them to STEP/STL formats using OpenCascade.

## Features

- 🎨 Configure parametric 3D models (Box, Cylinder, Cone, Sphere, Bottle)
- 👁️ Real-time 3D preview with Three.js
- 📥 Export to STEP, STL, BREP formats
- 💾 Save and manage configurations

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install all project dependencies
npm run install:all
```

### 2. Setup PythonOCC (CAD Engine)

```bash
# Create conda environment
conda create -n opencascade python=3.10 -y
conda activate opencascade
conda install -c conda-forge pythonocc-core -y
```

### 3. Configure Environment

Create `server/.env` file:

```env
PORT=5001
DATABASE_URL="your_postgresql_connection_string"
PYTHON_PATH="/path/to/conda/envs/opencascade/bin/python"
```

Get your Python path:
```bash
conda activate opencascade
which python
```

### 4. Setup Database

```bash
cd server
npx prisma generate
npx prisma db push
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This runs both frontend (port 3000) and backend (port 5001) simultaneously.

**Or run separately:**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Open Application

Navigate to `http://localhost:3000`

## Usage

1. Select a product from the catalog
2. Adjust parameters using sliders
3. Click "Generate Model"
4. View 3D preview and download files

## Tech Stack

- **Frontend**: Next.js, React, Three.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, TypeScript
- **CAD Engine**: PythonOCC (OpenCascade)
- **Database**: PostgreSQL

## Troubleshooting

**Frontend not starting?**
```bash
cd frontend && npm install
```

**Backend errors?**
- Check `PYTHON_PATH` in `server/.env`
- Verify: `conda activate opencascade && python python-api/test_occt.py`

**Database issues?**
- Verify `DATABASE_URL` in `server/.env`
- Run: `cd server && npx prisma db push`

## Documentation

- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Detailed project status
- [QUICK_START.md](QUICK_START.md) - Comprehensive setup guide
- [BACKEND_README.md](BACKEND_README.md) - Backend architecture

## License

Proprietary - All rights reserved

