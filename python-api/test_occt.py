#!/usr/bin/env python3
"""
Simple test script to verify PythonOCC installation
Generates a box and exports to STEP and STL
"""

import sys
import os

try:
    from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
    from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
    from OCC.Core.StlAPI import StlAPI_Writer
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.IFSelect import IFSelect_RetDone
    print("✅ PythonOCC modules imported successfully!")
except ImportError as e:
    print(f"❌ Failed to import PythonOCC: {e}")
    print("\n📝 Install PythonOCC via Conda:")
    print("   conda create -n opencascade python=3.10")
    print("   conda activate opencascade")
    print("   conda install -c conda-forge pythonocc-core")
    sys.exit(1)

def test_box_generation():
    """Test generating a simple box"""
    print("\n🔨 Creating a 100x100x100 mm box...")
    box = BRepPrimAPI_MakeBox(100.0, 100.0, 100.0).Shape()
    print("✅ Box created successfully!")
    return box

def test_step_export(shape, filename="output/test_box.step"):
    """Test STEP export"""
    os.makedirs("output", exist_ok=True)
    print(f"\n📤 Exporting to STEP: {filename}")
    
    step_writer = STEPControl_Writer()
    step_writer.Transfer(shape, STEPControl_AsIs)
    status = step_writer.Write(filename)
    
    if status == IFSelect_RetDone:
        print(f"✅ STEP file saved: {filename}")
        return True
    else:
        print(f"❌ STEP export failed")
        return False

def test_stl_export(shape, filename="output/test_box.stl"):
    """Test STL export"""
    print(f"\n📤 Exporting to STL: {filename}")
    
    # Mesh the shape first
    mesh = BRepMesh_IncrementalMesh(shape, 0.1)
    mesh.Perform()
    
    stl_writer = StlAPI_Writer()
    stl_writer.Write(shape, filename)
    
    print(f"✅ STL file saved: {filename}")
    return True

def main():
    print("=" * 60)
    print("🧪 PythonOCC Installation Test")
    print("=" * 60)
    
    try:
        # Test box generation
        box = test_box_generation()
        
        # Test STEP export
        test_step_export(box)
        
        # Test STL export
        test_stl_export(box)
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! PythonOCC is working correctly.")
        print("=" * 60)
        print("\n📁 Check the output/ directory for generated files:")
        print("   - test_box.step (for CAD software)")
        print("   - test_box.stl  (for 3D printing)")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())

