#!/usr/bin/env python3
"""
PythonOCC Model Generator
Generates parametric 3D models and exports to various formats

Requirements:
    pip install pythonocc-core

Usage:
    python generate_model.py <width> <height> <depth> <output_base_path>
"""

import sys
import os

def generate_model_fallback(width, height, depth, output_path):
    """
    Fallback implementation when PythonOCC is not available
    Creates simple placeholder files
    """
    print(f"⚠️ PythonOCC not available. Creating placeholder files.")
    print(f"📦 Model parameters: {width}x{height}x{depth}")
    
    # Create a simple STEP placeholder
    step_content = f"""ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Parametric Box Model - Placeholder'),'2;1');
FILE_NAME('model.step','', (''), (''), 'pythonocc-generator', '', '');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;
/* Box dimensions: {width}x{height}x{depth} */
ENDSEC;
END-ISO-10303-21;
"""
    
    # Create a simple DXF placeholder
    dxf_content = f"""0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
0
10
0.0
20
0.0
30
0.0
40
5.0
1
Dimensions: {width}x{height}x{depth}
0
ENDSEC
0
EOF
"""
    
    try:
        with open(f"{output_path}.step", 'w') as f:
            f.write(step_content)
        print(f"✅ Created: {output_path}.step")
        
        with open(f"{output_path}.dxf", 'w') as f:
            f.write(dxf_content)
        print(f"✅ Created: {output_path}.dxf")
        
        return True
    except Exception as e:
        print(f"❌ Error creating files: {e}")
        return False

def generate_model_with_occ(width, height, depth, output_path):
    """
    Generate model using PythonOCC
    """
    try:
        from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
        from OCC.Core.gp import gp_Pnt
        from OCC.Core.BRepTools import breptools_Write
        from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
        from OCC.Core.StlAPI import StlAPI_Writer
        from OCC.Core.IFSelect import IFSelect_RetDone
        
        print(f"🔧 Generating model with PythonOCC...")
        print(f"📦 Dimensions: Width={width}, Height={height}, Depth={depth}")
        
        # Create a box centered at origin
        point = gp_Pnt(-width/2, -height/2, -depth/2)
        box_shape = BRepPrimAPI_MakeBox(point, width, height, depth).Shape()
        
        # Export to STEP
        step_writer = STEPControl_Writer()
        step_writer.Transfer(box_shape, STEPControl_AsIs)
        status = step_writer.Write(f"{output_path}.step")
        
        if status == IFSelect_RetDone:
            print(f"✅ STEP file created: {output_path}.step")
        else:
            print(f"⚠️ STEP export warning: status={status}")
        
        # Export to STL
        stl_writer = StlAPI_Writer()
        stl_writer.SetASCIIMode(True)
        stl_writer.Write(box_shape, f"{output_path}.stl")
        print(f"✅ STL file created: {output_path}.stl")
        
        # Export to BREP (native OCC format)
        breptools_Write(box_shape, f"{output_path}.brep")
        print(f"✅ BREP file created: {output_path}.brep")
        
        # DXF export requires additional modules
        # For M1, we'll use a simplified 2D projection
        try:
            generate_dxf_projection(width, height, depth, f"{output_path}.dxf")
        except Exception as e:
            print(f"⚠️ DXF generation skipped: {e}")
        
        return True
        
    except ImportError as e:
        print(f"⚠️ PythonOCC import error: {e}")
        print("   Install with: pip install pythonocc-core")
        return False
    except Exception as e:
        print(f"❌ Error during model generation: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_dxf_projection(width, height, depth, output_file):
    """
    Generate 2D DXF projection views
    """
    dxf_content = f"""0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
4
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
"""
    
    # Front view (centered at origin)
    w, h = width, height
    dxf_content += f"""0
LINE
8
0
10
{-w/2}
20
{-h/2}
11
{w/2}
21
{-h/2}
0
LINE
8
0
10
{w/2}
20
{-h/2}
11
{w/2}
21
{h/2}
0
LINE
8
0
10
{w/2}
20
{h/2}
11
{-w/2}
21
{h/2}
0
LINE
8
0
10
{-w/2}
20
{h/2}
11
{-w/2}
21
{-h/2}
"""
    
    # Dimension text
    dxf_content += f"""0
TEXT
8
0
10
0
20
{h/2 + 10}
40
5
1
W:{width} H:{height} D:{depth}
"""
    
    dxf_content += """0
ENDSEC
0
EOF
"""
    
    with open(output_file, 'w') as f:
        f.write(dxf_content)
    print(f"✅ DXF file created: {output_file}")

def main():
    if len(sys.argv) != 5:
        print("Usage: python generate_model.py <width> <height> <depth> <output_path>")
        sys.exit(1)
    
    try:
        width = float(sys.argv[1])
        height = float(sys.argv[2])
        depth = float(sys.argv[3])
        output_path = sys.argv[4]
        
        print(f"=" * 60)
        print(f"PythonOCC Model Generator")
        print(f"=" * 60)
        
        # Try to generate with PythonOCC first
        success = generate_model_with_occ(width, height, depth, output_path)
        
        # Fallback if PythonOCC is not available
        if not success:
            success = generate_model_fallback(width, height, depth, output_path)
        
        if success:
            print(f"=" * 60)
            print(f"✅ Model generation completed successfully!")
            print(f"=" * 60)
            sys.exit(0)
        else:
            print(f"❌ Model generation failed")
            sys.exit(1)
            
    except ValueError as e:
        print(f"❌ Invalid parameters: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

