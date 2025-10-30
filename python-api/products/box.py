#!/usr/bin/env python3
"""
Parametric Box Generator using PythonOCC
Generates a simple box with customizable dimensions and exports CAD files
"""

import sys
import json
import argparse
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.StlAPI import StlAPI_Writer
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib_Add
import os

# Ensure we can import from python-api/core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import custom exporter
from core.exporter import export_all_formats


def create_box(params):
    """
    Create a parametric box based on input parameters
    
    Parameters:
    - width: float (mm)
    - height: float (mm)
    - depth: float (mm)
    """
    width = params.get('width', 100)
    height = params.get('height', 100)
    depth = params.get('depth', 100)
    
    # Create box
    box = BRepPrimAPI_MakeBox(width, height, depth).Shape()
    
    return box


def export_preview_data(shape):
    """Generate simplified preview data for frontend Three.js"""
    bbox = Bnd_Box()
    brepbndlib_Add(shape, bbox)
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
    
    return {
        "boundingBox": {
            "min": [xmin, ymin, zmin],
            "max": [xmax, ymax, zmax]
        },
        "center": [
            (xmin + xmax) / 2,
            (ymin + ymax) / 2,
            (zmin + zmax) / 2
        ]
    }


def main():
    parser = argparse.ArgumentParser(description='Generate parametric box')
    parser.add_argument('--params', type=str, required=True, help='JSON parameters')
    parser.add_argument('--output-dir', type=str, default='./output', help='Output directory')
    parser.add_argument('--model-id', type=str, required=True, help='Model ID for filenames')
    
    args = parser.parse_args()
    params = json.loads(args.params)
    
    print(f"Generating box with params: {params}")
    
    # Generate the box
    box = create_box(params)
    
    # Ensure output directory exists
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Export files (STEP/STL/BREP) via common exporter
    base_path = os.path.join(args.output_dir, args.model_id)
    results = export_all_formats(box, base_path)
    
    # Generate preview data
    preview = export_preview_data(box)
    
    # Return result as JSON
    result = {
        "success": True,
        "files": {
            "step": results["step"]["file"] if results["step"]["success"] else None,
            "stl": results["stl"]["file"] if results["stl"]["success"] else None,
            "brep": results["brep"]["file"] if results["brep"]["success"] else None,
        },
        "preview": preview,
        "parameters": params,
    }
    
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())

