# Python Setup for PythonOCC

## Why PythonOCC?

PythonOCC provides Python bindings for **Open CASCADE Technology (OCCT)**, the industry-standard CAD kernel used by:
- FreeCAD
- Salome
- KiCad (STEP export)
- Many commercial CAD systems

## Installation (Professional Method)

### Prerequisites

- Python 3.8 or higher
- conda (Miniconda or Anaconda)

### Step 1: Install Conda

**macOS:**
```bash
brew install miniconda
```

**Linux:**
```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
```

**Windows:**
Download from: https://docs.conda.io/en/latest/miniconda.html

### Step 2: Create Conda Environment

```bash
conda create -n opencascade python=3.10 -y
```

### Step 3: Activate Environment

```bash
conda activate opencascade
```

### Step 4: Install PythonOCC

```bash
conda install -c conda-forge pythonocc-core -y
```

### Step 5: Verify Installation

```bash
python -c "import OCC.Core.BRepPrimAPI; print('✅ PythonOCC works!')"
```

### Step 6: Find Python Path

```bash
which python
```

Example output: `/Users/yourname/miniconda3/envs/opencascade/bin/python`

### Step 7: Update Configuration

Edit `server/.env`:
```env
PYTHON_PATH=/Users/yourname/miniconda3/envs/opencascade/bin/python
```

## Why Not pip?

**PythonOCC has complex C++ dependencies:**
- OpenCASCADE Technology (OCCT) library
- OpenGL libraries
- TBB (Threading Building Blocks)
- FreeType
- FreeImage
- And many more...

**Building from source requires:**
- C++ compiler toolchain
- CMake
- All development headers
- 1-2 hours of compilation time
- Often fails on different platforms

**Conda provides:**
- ✅ Pre-built binaries
- ✅ All dependencies included
- ✅ Works on all platforms
- ✅ Installs in 2-3 minutes

## Alternative: Use Node.js Fallback

If you don't need full CAD capabilities, the server will automatically use a Node.js fallback implementation that provides:
- ✅ Basic box geometry
- ✅ DXF export (2D drawings)
- ✅ PDF export (documentation)
- ❌ STEP export (requires PythonOCC)
- ❌ STL export (requires PythonOCC)

## Troubleshooting

### Conda not found after installation

Add conda to your PATH:
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/miniconda3/bin:$PATH"
```

### Import Error: No module named 'OCC'

Make sure you:
1. Activated the conda environment: `conda activate opencascade`
2. Installed pythonocc-core: `conda install -c conda-forge pythonocc-core`
3. Updated PYTHON_PATH in `.env` to point to conda python

### Server still says "PythonOCC not available"

Check your `.env` file:
```bash
# Should point to conda environment python
PYTHON_PATH=/path/to/conda/envs/opencascade/bin/python

# Verify path exists
ls -la /path/to/conda/envs/opencascade/bin/python
```

## Professional Python Project Structure

```
server/
├── pyproject.toml          # Modern Python project config (PEP 518)
├── requirements.txt        # Dependencies documentation
├── Makefile               # Professional build automation
├── scripts/
│   └── generate_model.py  # CAD generation script
└── src/
    └── services/
        └── openCascadeService.ts  # Node.js integration
```

## Development Workflow

```bash
# 1. Activate conda environment
conda activate opencascade

# 2. Start Node.js server (will use conda python)
npm run dev

# 3. Test PythonOCC integration
curl http://localhost:3001/api/v1/geometry/test
```

## Production Deployment

For production, use Docker with conda:

```dockerfile
FROM continuumio/miniconda3

# Create conda environment
RUN conda create -n opencascade python=3.10 -y
RUN conda install -n opencascade -c conda-forge pythonocc-core -y

# Activate environment
SHELL ["conda", "run", "-n", "opencascade", "/bin/bash", "-c"]

# Your app code
COPY . /app
WORKDIR /app

# Install Node.js dependencies
RUN apt-get update && apt-get install -y nodejs npm
RUN npm install

CMD ["npm", "start"]
```

## Resources

- **PythonOCC GitHub:** https://github.com/tpaviot/pythonocc-core
- **OpenCASCADE Documentation:** https://dev.opencascade.org/
- **Conda Documentation:** https://docs.conda.io/
- **Project Structure (PEP 518):** https://peps.python.org/pep-0518/

---

**Note:** This project follows Python community best practices and uses industry-standard tools.

