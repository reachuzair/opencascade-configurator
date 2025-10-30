# Open Cascade Configurator - Backend Server

Backend API server for the Open Cascade web configurator system. Built with Node.js, Express, TypeScript, and integrates with PythonOCC for CAD operations.

## 🏗️ Architecture

```
server/
├── src/
│   ├── config/
│   │   └── database.ts         # MSSQL database configuration
│   ├── models/
│   │   └── Configuration.ts    # Sequelize model for configurations
│   ├── controllers/
│   │   └── geometryController.ts  # Request handlers
│   ├── routes/
│   │   └── geometryRoutes.ts   # API route definitions
│   ├── services/
│   │   ├── modelService.ts     # Node.js model generation (fallback)
│   │   └── openCascadeService.ts  # PythonOCC integration
│   ├── app.ts                  # Main Express application
│   └── index.ts                # Legacy entry point (backward compatible)
├── scripts/
│   └── generate_model.py       # PythonOCC CAD generation script
├── output/                     # Generated model files (gitignored)
├── Dockerfile
├── .dockerignore
├── env.example
└── README.md
```

## 🚀 Tech Stack

- **Node.js 18+**
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Sequelize** - ORM for MSSQL
- **Microsoft SQL Server** - Database
- **PythonOCC** - Python bindings for Open Cascade CAD kernel
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Python 3.8+ (for PythonOCC)
- Microsoft SQL Server (optional, for persistence)

### Setup

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Install Python dependencies (optional but recommended):**
```bash
pip3 install pythonocc-core
```

3. **Configure environment variables:**
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (optional)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ConfiguratorDB
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd

# Python
PYTHON_PATH=python3
```

## 🎮 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Legacy Mode (backward compatible)
```bash
npm run dev:legacy
```

## 📡 API Endpoints

### Base URL: `http://localhost:3001`

#### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

---

### Legacy API (Backward Compatible)

#### Generate Model
```http
POST /api/generate-model
Content-Type: application/json

{
  "width": 100,
  "height": 100,
  "depth": 100
}
```

#### Export to DXF
```http
POST /api/export/dxf
Content-Type: application/json

{
  "width": 100,
  "height": 100,
  "depth": 100
}
```

#### Export to PDF
```http
POST /api/export/pdf
Content-Type: application/json

{
  "width": 100,
  "height": 100,
  "depth": 100
}
```

---

### API v1 (Enhanced Features)

Base path: `/api/v1/geometry`

#### Test Endpoint
```http
GET /api/v1/geometry/test
```

Response:
```json
{
  "success": true,
  "message": "Backend server is running",
  "pythonOCC": "Available",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

#### Generate Parametric Model
```http
POST /api/v1/geometry/generate
Content-Type: application/json

{
  "width": 100,
  "height": 150,
  "depth": 75,
  "name": "My Box Config",
  "saveConfig": true
}
```

Response:
```json
{
  "success": true,
  "message": "Model generated successfully with PythonOCC",
  "model": {
    "vertices": [[...]],
    "faces": [[...]],
    "edges": [[...]],
    "dimensions": { "width": 100, "height": 150, "depth": 75 }
  },
  "files": {
    "step": "/api/v1/geometry/download/1234567890.step",
    "dxf": "/api/v1/geometry/download/1234567890.dxf",
    "stl": "/api/v1/geometry/download/1234567890.stl"
  }
}
```

#### Export to Specific Format
```http
POST /api/v1/geometry/export/:format
Content-Type: application/json

{
  "width": 100,
  "height": 100,
  "depth": 100
}
```

Supported formats: `step`, `stl`, `dxf`, `pdf`

Example:
```bash
curl -X POST http://localhost:3001/api/v1/geometry/export/step \
  -H "Content-Type: application/json" \
  -d '{"width": 100, "height": 100, "depth": 100}' \
  --output model.step
```

#### Get All Configurations
```http
GET /api/v1/geometry/configurations
```

#### Get Specific Configuration
```http
GET /api/v1/geometry/configurations/:id
```

#### Delete Configuration
```http
DELETE /api/v1/geometry/configurations/:id
```

## 🐍 PythonOCC Integration

### Installation

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev
pip3 install pythonocc-core
```

**On macOS:**
```bash
brew install python3
pip3 install pythonocc-core
```

**On Windows:**
```powershell
# Install via conda (recommended)
conda install -c conda-forge pythonocc-core
```

### Verification

Check if PythonOCC is installed:
```bash
python3 -c "import OCC.Core.BRepPrimAPI; print('PythonOCC is installed!')"
```

### Fallback Mode

If PythonOCC is not available, the server automatically falls back to a Node.js-based implementation for basic functionality. Install PythonOCC for full CAD capabilities.

## 🗄️ Database Setup (Optional)

### Microsoft SQL Server

1. **Install SQL Server:**
   - [Download SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads)
   - Or use Docker: `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest`

2. **Create Database:**
```sql
CREATE DATABASE ConfiguratorDB;
```

3. **Update `.env` with connection details**

4. **Run server** - Database tables will be created automatically

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t open-cascade-backend .
```

### Run Container
```bash
docker run -p 3001:3001 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=YourStrong!Passw0rd \
  open-cascade-backend
```

### Docker Compose
From project root:
```bash
docker-compose up
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Test endpoint
curl http://localhost:3001/api/v1/geometry/test

# Generate model
curl -X POST http://localhost:3001/api/v1/geometry/generate \
  -H "Content-Type: application/json" \
  -d '{"width": 100, "height": 100, "depth": 100}'
```

## 🔧 Development

### Project Structure Conventions

- **Controllers:** Handle HTTP requests and responses
- **Services:** Business logic and external integrations
- **Models:** Database models using Sequelize
- **Routes:** API endpoint definitions
- **Config:** Configuration files (database, etc.)

### Adding New Features

1. Create service in `src/services/`
2. Create controller in `src/controllers/`
3. Add routes in `src/routes/`
4. Update models if needed

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use async/await for asynchronous operations
- Add error handling for all endpoints

## 📊 Monitoring

### Logs
The server logs important events:
- ✅ Successful operations
- ⚠️ Warnings (missing dependencies, database issues)
- ❌ Errors

### Health Check
Monitor server health via `/api/health` endpoint

## 🗺️ Roadmap

### M1 (Current)
- [x] Basic Express server
- [x] PythonOCC integration
- [x] STEP/DXF/STL export
- [x] Database model setup
- [x] Docker support

### M2 (Next)
- [ ] Enhanced 2D drawing generation
- [ ] Dimension annotations in DXF
- [ ] Title blocks and borders
- [ ] Layer management

### M3
- [ ] Multiple parametric shapes
- [ ] Material properties
- [ ] User authentication
- [ ] Configuration versioning

### M4
- [ ] Azure deployment
- [ ] Production database
- [ ] Scalability optimizations
- [ ] Advanced CAD operations

## 🤝 Contributing

This is a milestone-based project. Follow the established patterns and ensure all new features include:
- TypeScript types
- Error handling
- API documentation
- Logging

## 📄 License

Proprietary - All rights reserved

## 🆘 Troubleshooting

### PythonOCC not found
```
⚠️ PythonOCC not found. Using fallback mode.
Install with: pip install pythonocc-core
```
**Solution:** Install PythonOCC or use fallback mode

### Database connection failed
```
❌ Unable to connect to the database
```
**Solution:** Check MSSQL is running and credentials in `.env` are correct

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Change `PORT` in `.env` or stop the process using port 3001

---

**Built with ❤️ using Node.js, Express, TypeScript, and PythonOCC**

