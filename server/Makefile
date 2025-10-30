.PHONY: help install install-dev install-pythonocc setup clean test

help:
	@echo "Open Cascade Configurator - Server"
	@echo ""
	@echo "Available commands:"
	@echo "  make install          - Install Node.js dependencies"
	@echo "  make install-pythonocc - Install PythonOCC (requires conda)"
	@echo "  make setup            - Complete setup (Node + Python)"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make test             - Run tests"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. make setup"
	@echo "  2. npm run dev"

install:
	@echo "📦 Installing Node.js dependencies..."
	npm install

install-pythonocc:
	@echo ""
	@echo "=========================================="
	@echo "PythonOCC Installation"
	@echo "=========================================="
	@echo ""
	@echo "⚠️  IMPORTANT: Use conda for PythonOCC"
	@echo ""
	@echo "Step 1: Install conda (if not installed):"
	@echo "  macOS:   brew install miniconda"
	@echo "  Linux:   wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && bash Miniconda3-latest-Linux-x86_64.sh"
	@echo "  Windows: https://docs.conda.io/en/latest/miniconda.html"
	@echo ""
	@echo "Step 2: Create conda environment:"
	@echo "  conda create -n opencascade python=3.10 -y"
	@echo ""
	@echo "Step 3: Activate environment:"
	@echo "  conda activate opencascade"
	@echo ""
	@echo "Step 4: Install PythonOCC:"
	@echo "  conda install -c conda-forge pythonocc-core -y"
	@echo ""
	@echo "Step 5: Verify installation:"
	@echo "  python -c 'import OCC.Core.BRepPrimAPI; print(\"✅ PythonOCC works!\")'"
	@echo ""
	@echo "Step 6: Get Python path:"
	@echo "  which python"
	@echo ""
	@echo "Step 7: Update .env file:"
	@echo "  PYTHON_PATH=/path/to/conda/envs/opencascade/bin/python"
	@echo ""
	@echo "=========================================="

setup: install
	@echo ""
	@echo "✅ Node.js setup complete!"
	@echo ""
	@echo "Next: Set up Python environment"
	@echo "Run: make install-pythonocc"
	@echo ""

clean:
	@echo "🧹 Cleaning..."
	rm -rf node_modules dist output
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	@echo "✅ Clean complete"

test:
	@echo "🧪 Running tests..."
	npm test
	@echo "✅ Tests complete"

