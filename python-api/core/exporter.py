"""
CAD File Export Utilities
Handles export to STEP, STL, and DXF formats
"""

import os
from typing import Optional
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.StlAPI import StlAPI_Writer
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib_Add


def export_step(shape, filename: str) -> bool:
    """
    Export shape to STEP format (ISO 10303-21)
    
    Args:
        shape: OpenCascade shape object
        filename: Output filename
        
    Returns:
        bool: True if export successful
    """
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        step_writer = STEPControl_Writer()
        step_writer.Transfer(shape, STEPControl_AsIs)
        status = step_writer.Write(filename)
        
        return status == IFSelect_RetDone
    except Exception as e:
        print(f"Error exporting STEP: {e}")
        return False


def export_stl(shape, filename: str, linear_deflection: float = 0.1) -> bool:
    """
    Export shape to STL format for 3D printing
    
    Args:
        shape: OpenCascade shape object
        filename: Output filename
        linear_deflection: Mesh quality (lower = finer mesh)
        
    Returns:
        bool: True if export successful
    """
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        # Generate mesh
        mesh = BRepMesh_IncrementalMesh(shape, linear_deflection)
        mesh.Perform()
        
        if not mesh.IsDone():
            print("Warning: Mesh generation may be incomplete")
        
        # Write STL
        stl_writer = StlAPI_Writer()
        stl_writer.Write(shape, filename)
        
        return True
    except Exception as e:
        print(f"Error exporting STL: {e}")
        return False


def export_brep(shape, filename: str) -> bool:
    """
    Export shape to BREP format (native OCCT format)
    
    Args:
        shape: OpenCascade shape object
        filename: Output filename
        
    Returns:
        bool: True if export successful
    """
    try:
        from OCC.Core.BRepTools import breptools_Write
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        return breptools_Write(shape, filename)
    except Exception as e:
        print(f"Error exporting BREP: {e}")
        return False


def get_bounding_box(shape) -> dict:
    """
    Get bounding box dimensions of a shape
    
    Args:
        shape: OpenCascade shape object
        
    Returns:
        dict: Bounding box data with min/max coordinates and center
    """
    try:
        bbox = Bnd_Box()
        brepbndlib_Add(shape, bbox)
        
        xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()
        
        return {
            "min": [xmin, ymin, zmin],
            "max": [xmax, ymax, zmax],
            "center": [
                (xmin + xmax) / 2,
                (ymin + ymax) / 2,
                (zmin + zmax) / 2
            ],
            "dimensions": [
                xmax - xmin,
                ymax - ymin,
                zmax - zmin
            ]
        }
    except Exception as e:
        print(f"Error getting bounding box: {e}")
        return {
            "min": [0, 0, 0],
            "max": [0, 0, 0],
            "center": [0, 0, 0],
            "dimensions": [0, 0, 0]
        }


def export_all_formats(shape, base_filename: str) -> dict:
    """
    Export shape to all supported formats
    
    Args:
        shape: OpenCascade shape object
        base_filename: Base filename without extension
        
    Returns:
        dict: Dictionary with file paths and success status
    """
    results = {}
    
    # Export STEP
    step_file = f"{base_filename}.step"
    results["step"] = {
        "file": step_file,
        "success": export_step(shape, step_file)
    }
    
    # Export STL
    stl_file = f"{base_filename}.stl"
    results["stl"] = {
        "file": stl_file,
        "success": export_stl(shape, stl_file)
    }
    
    # Export BREP
    brep_file = f"{base_filename}.brep"
    results["brep"] = {
        "file": brep_file,
        "success": export_brep(shape, brep_file)
    }
    
    # Get bounding box for preview
    results["boundingBox"] = get_bounding_box(shape)
    
    return results

