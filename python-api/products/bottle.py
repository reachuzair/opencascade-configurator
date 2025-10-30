#!/usr/bin/env python3
"""
Parametric Bottle Generator using PythonOCC
Generates a bottle with customizable parameters and exports CAD files
"""

import sys
import json
import argparse
import re
import os

# Add parent directory to path to import core modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from OCC.Core.BRepPrimAPI import (
    BRepPrimAPI_MakeCylinder,
    BRepPrimAPI_MakeCone,
)
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut, BRepAlgoAPI_Fuse
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.gp import gp_Pnt, gp_Ax2, gp_Dir, gp_Trsf, gp_Vec
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopAbs import TopAbs_EDGE
from core.exporter import export_all_formats


def create_bottle(params: dict):
    """
    Create a parametric bottle based on input parameters
    
    Parameters:
    - neckDiameter: float (mm) - Diameter of bottle neck
    - bodyHeight: float (mm) - Height of bottle body
    - bodyRadius: float (mm) - Radius of bottle body
    - wallThickness: float (mm) - Wall thickness
    - material: string - Material type (for reference)
    - threadType: string (optional) - Thread specification
    
    Returns:
        OpenCascade Shape object
    """
    neck_dia = params.get('neckDiameter', 20)
    body_height = params.get('bodyHeight', 150)
    body_radius = params.get('bodyRadius', 40)
    wall_thickness = params.get('wallThickness', 3)
    thread_type = params.get('threadType', 'None')

    # If a metric thread is selected (e.g., M20x1.5),
    # align neck diameter to the thread major diameter and adapt neck height by pitch
    if isinstance(thread_type, str) and thread_type not in ("", "None"):
        m = re.match(r"M(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)", thread_type)
        if m:
            try:
                major_dia = float(m.group(1))
                pitch = float(m.group(2))
                neck_dia = major_dia
                # Make thread height proportional to pitch so change is visible
                # (not modelling real helical thread in MVP)
                neck_height_override = max(20.0, 8.0 * pitch)
            except Exception:
                neck_height_override = None
        else:
            neck_height_override = None
    else:
        neck_height_override = None
    
    print(f"Creating bottle: neck={neck_dia}mm, body={body_height}x{body_radius}mm, wall={wall_thickness}mm")
    
    # Create body (tapered cone when bodyTaperDeg > 0, else cylinder)
    body_axis = gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(0, 0, 1))
    body_taper_deg = float(params.get('bodyTaperDeg', 0))
    if body_taper_deg > 0.0:
        from math import tan, radians
        top_radius = max(0.5, body_radius - body_height * tan(radians(body_taper_deg)))
        outer_body = BRepPrimAPI_MakeCone(body_axis, body_radius, top_radius, body_height).Shape()
        inner_base = max(0.5, body_radius - wall_thickness)
        inner_top = max(0.5, top_radius - wall_thickness)
        inner_height = max(1.0, body_height - wall_thickness)
        inner_body = BRepPrimAPI_MakeCone(body_axis, inner_base, inner_top, inner_height).Shape()
    else:
        outer_body = BRepPrimAPI_MakeCylinder(body_axis, body_radius, body_height).Shape()
        # Create hollow interior
        inner_radius = max(body_radius - wall_thickness, 1)  # Prevent negative radius
        inner_height = max(body_height - wall_thickness, 1)
        inner_body = BRepPrimAPI_MakeCylinder(
            body_axis, 
            inner_radius, 
            inner_height
        ).Shape()
    
    # Move inner body up slightly to create bottom
    transform = gp_Trsf()
    transform.SetTranslation(gp_Vec(0, 0, wall_thickness))
    inner_body_moved = BRepBuilderAPI_Transform(inner_body, transform, False).Shape()
    
    # Cut inner from outer to create hollow body
    hollow_body = BRepAlgoAPI_Cut(outer_body, inner_body_moved).Shape()
    
    # Create neck
    neck_axis = gp_Ax2(gp_Pnt(0, 0, body_height), gp_Dir(0, 0, 1))
    neck_height = neck_height_override if neck_height_override is not None else 30.0
    neck_radius = neck_dia / 2
    outer_neck = BRepPrimAPI_MakeCylinder(neck_axis, neck_radius, neck_height).Shape()
    
    inner_neck_radius = max(neck_radius - wall_thickness, 0.5)
    inner_neck = BRepPrimAPI_MakeCylinder(
        neck_axis, 
        inner_neck_radius, 
        neck_height
    ).Shape()
    
    hollow_neck = BRepAlgoAPI_Cut(outer_neck, inner_neck).Shape()
    
    # Fuse body and neck
    bottle = BRepAlgoAPI_Fuse(hollow_body, hollow_neck).Shape()

    # Optional bottom concavity (punt)
    bottom_concavity = float(params.get('bottomConcavity', 0))
    if bottom_concavity > 0.05:
        punt_axis = gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(0, 0, -1))
        punt = BRepPrimAPI_MakeCylinder(punt_axis, max(1.0, body_radius - wall_thickness - 1.0), bottom_concavity).Shape()
        bottle = BRepAlgoAPI_Cut(bottle, punt).Shape()

    # Optional grip ribs (simple external cylinders fused around body)
    try:
        ribs_count = int(params.get('ribsCount', 0) or 0)
        rib_thick = float(params.get('ribThickness', 2))
        if ribs_count > 0 and rib_thick > 0.1:
            from math import pi
            angle_step = 2 * pi / ribs_count
            rib_height = max(10.0, body_height * 0.6)
            for i in range(ribs_count):
                ang = i * angle_step
                rib = BRepPrimAPI_MakeCylinder(body_axis, rib_thick, rib_height).Shape()
                t = gp_Trsf()
                t.SetTranslation(gp_Vec(body_radius + rib_thick * 0.5, 0, (body_height - rib_height) / 2))
                rib = BRepBuilderAPI_Transform(rib, t, False).Shape()
                r2 = gp_Trsf()
                from OCC.Core.gp import gp_Ax1
                r2.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(0, 0, 1)), ang)
                rib = BRepBuilderAPI_Transform(rib, r2, False).Shape()
                bottle = BRepAlgoAPI_Fuse(bottle, rib).Shape()
    except Exception:
        pass

    # Soft shoulder fillet (apply globally to avoid edge querying)
    fillet_rad = float(params.get('shoulderFillet', 0))
    if fillet_rad > 0.01:
        try:
            mk = BRepFilletAPI_MakeFillet(bottle)
            exp = TopExp_Explorer(bottle, TopAbs_EDGE)
            while exp.More():
                mk.Add(fillet_rad, exp.Current())
                exp.Next()
            bottle = mk.Shape()
        except Exception:
            pass
    
    return bottle


def main():
    parser = argparse.ArgumentParser(description='Generate parametric bottle')
    parser.add_argument('--params', type=str, required=True, help='JSON parameters')
    parser.add_argument('--output-dir', type=str, default='./output', help='Output directory')
    parser.add_argument('--model-id', type=str, required=True, help='Model ID for filenames')
    
    args = parser.parse_args()
    
    try:
        params = json.loads(args.params)
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"Invalid JSON parameters: {e}"
        }))
        return 1
    
    try:
        # Generate the bottle
        bottle = create_bottle(params)
        
        # Export files
        base_path = os.path.join(args.output_dir, args.model_id)
        results = export_all_formats(bottle, base_path)
        
        # Build response
        response = {
            "success": True,
            "files": {
                "step": results["step"]["file"] if results["step"]["success"] else None,
                "stl": results["stl"]["file"] if results["stl"]["success"] else None,
                "brep": results["brep"]["file"] if results["brep"]["success"] else None,
            },
            "preview": {
                "boundingBox": results["boundingBox"]
            },
            "parameters": params
        }
        
        print(json.dumps(response))
        return 0
        
    except Exception as e:
        import traceback
        print(json.dumps({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }))
        return 1


if __name__ == "__main__":
    sys.exit(main())

