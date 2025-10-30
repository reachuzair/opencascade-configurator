# CAD Configurator - Backend API

Backend API for the Open Cascade CAD Configurator, providing parametric 3D model generation and CAD file exports.

## 🏗️ Architecture

```
Backend API (Node.js + Express)
    ↓
Python CAD Engine (PythonOCC)
    ↓
PostgreSQL Database (Prisma ORM)
```

## 🚀 Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **CAD Engine**: PythonOCC (Open Cascade Technology)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Export Formats**: STEP, STL, BREP

## 📦 Project Structure

```
open-cascade-configurator-backend/
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── app.ts         # Express server
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   └── services/      # Business logic
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Sample data
│   ├── package.json
│   └── .env
│
└── python-api/            # PythonOCC CAD engine
    ├── core/
    │   └── exporter.py    # CAD export utilities
    ├── products/
    │   ├── box.py         # Box generator
    │   └── bottle.py      # Bottle generator
    ├── test_occt.py       # Test script
    └── requirements.txt
```

## 🔧 Installation

### Prerequisites
- Node.js 18+
- Python 3.10 (via Conda)
- PostgreSQL database

### 1. Install PythonOCC

```bash
# Install Miniconda (if not already installed)
brew install --cask miniconda

# Create conda environment
conda create -n opencascade python=3.10 -y
conda activate opencascade

# Install PythonOCC
conda install -c conda-forge pythonocc-core -y

# Test installation
python python-api/test_occt.py
```

### 2. Install Node Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment

Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Python Configuration (get path with: conda activate opencascade && which python)
PYTHON_PATH=/opt/homebrew/Caskroom/miniconda/base/envs/opencascade/bin/python
```

### 4. Setup Database

```bash
cd server

# Run migrations
npx prisma migrate dev

# Seed database with sample products
npx tsx prisma/seed.ts
```

## 🎮 Running the Backend

### Development Mode

```bash
cd server
npm run dev
```

Server runs on `http://localhost:5000`

### Production Mode

```bash
cd server
npm run build
npm start
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### Products
```
GET    /api/products              # List all products
GET    /api/products/:id          # Get product by ID
```

### Model Generation
```
POST   /api/products/:id/generate # Generate parametric model

Body:
{
  "parameters": {
    "width": 100,
    "height": 100,
    "depth": 100
  },
  "configName": "My Box Configuration"
}

Response:
{
  "success": true,
  "files": {
    "step": "/api/files/model_123.step",
    "stl": "/api/files/model_123.stl",
    "brep": "/api/files/model_123.brep"
  },
  "preview": {
    "boundingBox": { ... }
  }
}
```

### Configurations
```
GET    /api/configurations        # List saved configurations
GET    /api/configurations/:id    # Get configuration by ID
DELETE /api/configurations/:id    # Delete configuration
```

### File Downloads
```
GET    /api/files/:filename       # Download generated CAD file
```

## 🧪 Testing

### Test PythonOCC Installation
```bash
conda activate opencascade
python python-api/test_occt.py
```

Expected output:
```
✅ PythonOCC modules imported successfully!
🔨 Creating a 100x100x100 mm box...
✅ Box created successfully!
📤 Exporting to STEP: ./output/test_box.step
✅ STEP file saved
📤 Exporting to STL: ./output/test_box.stl
✅ STL file saved
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# List products
curl http://localhost:5000/api/products

# Generate box model
curl -X POST http://localhost:5000/api/products/2/generate \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {"width": 100, "height": 100, "depth": 100},
    "configName": "Test Box"
  }'
```

## 🐛 Troubleshooting

### PythonOCC Not Found
```bash
# Verify conda environment
conda activate opencascade
which python

# Update PYTHON_PATH in server/.env with the output
```

### Database Connection Issues
```bash
# Test database connection
cd server
npx prisma studio

# Reset database (if needed)
npx prisma migrate reset
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PYTHON_PATH` | Path to Python executable in conda env | `/path/to/conda/envs/opencascade/bin/python` |

## 📝 Adding New Products

1. Create Python generator in `python-api/products/your_shape.py`
2. Add product to database via `server/prisma/seed.ts`
3. Run seed: `cd server && npx tsx prisma/seed.ts`

Example structure:
```python
# python-api/products/your_shape.py
import sys
import json
from core.exporter import export_all_formats

def generate_shape(params):
    # Your OCCT code here
    return shape

if __name__ == "__main__":
    # Parse args and generate
    pass
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t cad-configurator-backend .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="your_db_url" \
  -e PYTHON_PATH="/opt/conda/envs/opencascade/bin/python" \
  cad-configurator-backend
```

### Azure
See deployment guide in main repository documentation.

## 📄 License

Proprietary - All rights reserved

---

**Built with Node.js, Express, PythonOCC, and Prisma**

