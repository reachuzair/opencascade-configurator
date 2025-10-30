# Python API for CAD Model Generation

## Structure
```
python-api/
├── venv/              # Python virtual environment
├── generate_model.py  # Main CAD generator script
├── output/            # Generated model files (.step, .stl)
└── requirements.txt
```

## Setup

```bash
# Venv already created, activate it:
source venv/bin/activate

# Optional: Install PythonOCC with conda
conda install -c conda-forge pythonocc-core
```

## Usage

```bash
# From venv
./venv/bin/python3 generate_model.py 100 150 75 output/my_model

# Output:
# output/my_model.step
# output/my_model.stl
```

## How Node.js Calls This

The Node.js server runs: `python3 generate_model.py <width> <height> <depth> <output_path>`

The script writes files, Node.js reads them and sends to user.

