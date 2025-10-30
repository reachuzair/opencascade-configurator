#!/bin/bash
echo "🚀 PythonOCC Installation Script"
echo "================================="
echo ""
echo "This script will guide you through installing PythonOCC via Conda"
echo ""

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "❌ Conda is not installed"
    echo ""
    echo "📥 Installing Miniconda..."
    echo "Running: brew install --cask miniconda"
    echo ""
    brew install --cask miniconda
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Miniconda"
        echo "Please install manually from: https://docs.conda.io/en/latest/miniconda.html"
        exit 1
    fi
    
    echo "✅ Miniconda installed!"
    echo "⚠️  You may need to restart your terminal"
    echo "Then run this script again"
    exit 0
fi

echo "✅ Conda is installed: $(conda --version)"
echo ""

# Check if environment exists
if conda env list | grep -q "^opencascade "; then
    echo "⚠️  Environment 'opencascade' already exists"
    read -p "Remove and reinstall? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        conda env remove -n opencascade -y
    else
        echo "Using existing environment"
        conda activate opencascade
        echo "✅ Environment activated"
        exit 0
    fi
fi

echo "📦 Creating conda environment 'opencascade'..."
conda create -n opencascade python=3.10 -y

if [ $? -ne 0 ]; then
    echo "❌ Failed to create conda environment"
    exit 1
fi

echo "✅ Environment created"
echo ""

# Activate environment
echo "🔄 Activating environment..."
eval "$(conda shell.bash hook)"
conda activate opencascade

echo "✅ Environment activated"
echo ""

# Install PythonOCC
echo "📦 Installing PythonOCC (this may take 5-10 minutes)..."
conda install -c conda-forge pythonocc-core -y

if [ $? -ne 0 ]; then
    echo "❌ Failed to install PythonOCC"
    exit 1
fi

echo "✅ PythonOCC installed!"
echo ""

# Test installation
echo "🧪 Testing PythonOCC..."
python -c "from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox; print('✅ PythonOCC works!')"

if [ $? -ne 0 ]; then
    echo "❌ PythonOCC test failed"
    exit 1
fi

echo ""
echo "🧪 Running full test script..."
cd python-api
python test_occt.py

echo ""
echo "================================="
echo "✅ Installation Complete!"
echo "================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Copy your Python path:"
which python
echo ""
echo "2. Update server/.env file:"
echo "   PYTHON_PATH=$(which python)"
echo ""
echo "3. To use PythonOCC in future, always activate:"
echo "   conda activate opencascade"
echo ""
