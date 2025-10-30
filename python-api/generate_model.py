#!/usr/bin/env python3
"""
Generate 3D CAD models using PythonOCC
Usage: python generate_model.py <width> <height> <depth> <output_path>
"""

import sys
import os

def generate_model_with_occ(width, height, depth, output_path):
    """Generate model using PythonOCC"""
    try:
        from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
        from OCC.Core.gp import gp_Pnt
        from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
        from OCC.Core.StlAPI import StlAPI_Writer
        from OCC.Core.IFSelect import IFSelect_RetDone
        
        # Create box centered at origin
        point = gp_Pnt(-width/2, -height/2, -depth/2)
        box_shape = BRepPrimAPI_MakeBox(point, width, height, depth).Shape()
        
        # Export STEP
        step_writer = STEPControl_Writer()
        step_writer.Transfer(box_shape, STEPControl_AsIs)
        step_writer.Write(f"{output_path}.step")
        print(f"✅ STEP: {output_path}.step")
        
        # Export STL
        stl_writer = StlAPI_Writer()
        stl_writer.SetASCIIMode(True)
        stl_writer.Write(box_shape, f"{output_path}.stl")
        print(f"✅ STL: {output_path}.stl")
        
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def generate_model_fallback(width, height, depth, output_path):
    """Fallback without PythonOCC"""
    # Simple STEP placeholder
    step_content = f"""ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Box {width}x{height}x{depth}'),'2;1');
FILE_NAME('box.step','','','','','','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;
ENDSEC;
END-ISO-10303-21;
"""
    
    with open(f"{output_path}.step", 'w') as f:
        f.write(step_content)
    
    print(f"⚠️  Using fallback (install PythonOCC for real CAD)")
    print(f"✅ STEP: {output_path}.step")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python generate_model.py <width> <height> <depth> <output_path>")
        sys.exit(1)
    
    width = float(sys.argv[1])
    height = float(sys.argv[2])
    depth = float(sys.argv[3])
    output_path = sys.argv[4]
    
    # Try PythonOCC first, fallback if not available
    success = generate_model_with_occ(width, height, depth, output_path)
    
    if not success:
        success = generate_model_fallback(width, height, depth, output_path)
    
    sys.exit(0 if success else 1)

