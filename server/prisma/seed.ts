import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Products
  const bottle = await prisma.product.upsert({
    where: { id: 1 },
    update: {
      parametersSchema: {
        product_id: "bottle_001",
        name: "Bottle",
        category: "Containers",
        parameters: [
          {
            name: "neckDiameter",
            label: "Neck Diameter (mm)",
            type: "number",
            min: 10,
            max: 50,
            default: 20,
            step: 1,
            required: true,
          },
          {
            name: "bodyHeight",
            label: "Body Height (mm)",
            type: "number",
            min: 50,
            max: 300,
            default: 150,
            step: 5,
            required: true,
          },
          {
            name: "bodyRadius",
            label: "Body Radius (mm)",
            type: "number",
            min: 20,
            max: 100,
            default: 40,
            step: 5,
            required: true,
          },
          {
            name: "wallThickness",
            label: "Wall Thickness (mm)",
            type: "number",
            min: 1,
            max: 10,
            default: 3,
            step: 0.5,
            required: true,
          },
          {
            name: "material",
            label: "Material",
            type: "select",
            options: ["Steel", "Aluminum", "Plastic", "Glass"],
            default: "Plastic",
            required: true,
          },
          {
            name: "threadType",
            label: "Thread Type",
            type: "select",
            options: ["None", "M20x1.5", "M24x2.0", "M30x2.0"],
            default: "M20x1.5",
            required: false,
          },
          // New cool options
          {
            name: "bodyTaperDeg",
            label: "Body Taper (deg)",
            type: "number",
            min: 0,
            max: 6,
            default: 2,
            step: 0.5,
          },
          {
            name: "bottomConcavity",
            label: "Bottom Concavity (mm)",
            type: "number",
            min: 0,
            max: 10,
            default: 2,
            step: 0.5,
          },
          {
            name: "shoulderFillet",
            label: "Shoulder Fillet (mm)",
            type: "number",
            min: 0,
            max: 5,
            default: 1,
            step: 0.5,
          },
          {
            name: "ribsCount",
            label: "Grip Ribs (count)",
            type: "number",
            min: 0,
            max: 12,
            default: 0,
            step: 1,
          },
          {
            name: "ribThickness",
            label: "Rib Thickness (mm)",
            type: "number",
            min: 1,
            max: 5,
            default: 2,
            step: 0.5,
          },
        ],
      },
    },
    create: {
      name: "Bottle",
      description:
        "Parametric bottle with customizable dimensions and threading",
      category: "Containers",
      scriptName: "bottle.py",
      thumbnailUrl: null,
      sortOrder: 1,
      parametersSchema: {
        product_id: "bottle_001",
        name: "Bottle",
        category: "Containers",
        parameters: [
          {
            name: "neckDiameter",
            label: "Neck Diameter (mm)",
            type: "number",
            min: 10,
            max: 50,
            default: 20,
            step: 1,
            required: true,
          },
          {
            name: "bodyHeight",
            label: "Body Height (mm)",
            type: "number",
            min: 50,
            max: 300,
            default: 150,
            step: 5,
            required: true,
          },
          {
            name: "bodyRadius",
            label: "Body Radius (mm)",
            type: "number",
            min: 20,
            max: 100,
            default: 40,
            step: 5,
            required: true,
          },
          {
            name: "wallThickness",
            label: "Wall Thickness (mm)",
            type: "number",
            min: 1,
            max: 10,
            default: 3,
            step: 0.5,
            required: true,
          },
          {
            name: "material",
            label: "Material",
            type: "select",
            options: ["Steel", "Aluminum", "Plastic", "Glass"],
            default: "Plastic",
            required: true,
          },
          {
            name: "threadType",
            label: "Thread Type",
            type: "select",
            options: ["None", "M20x1.5", "M24x2.0", "M30x2.0"],
            default: "M20x1.5",
            required: false,
          },
          // New cool options
          {
            name: "bodyTaperDeg",
            label: "Body Taper (deg)",
            type: "number",
            min: 0,
            max: 6,
            default: 2,
            step: 0.5,
          },
          {
            name: "bottomConcavity",
            label: "Bottom Concavity (mm)",
            type: "number",
            min: 0,
            max: 10,
            default: 2,
            step: 0.5,
          },
          {
            name: "shoulderFillet",
            label: "Shoulder Fillet (mm)",
            type: "number",
            min: 0,
            max: 5,
            default: 1,
            step: 0.5,
          },
          {
            name: "ribsCount",
            label: "Grip Ribs (count)",
            type: "number",
            min: 0,
            max: 12,
            default: 0,
            step: 1,
          },
          {
            name: "ribThickness",
            label: "Rib Thickness (mm)",
            type: "number",
            min: 1,
            max: 5,
            default: 2,
            step: 0.5,
          },
        ],
      },
    },
  });

  console.log(`✅ Created/Updated product: ${bottle.name}`);

  // Add more products here...
  const box = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Box",
      description: "Simple parametric box",
      category: "Basic Shapes",
      scriptName: "box.py",
      sortOrder: 2,
      parametersSchema: {
        product_id: "box_001",
        name: "Box",
        category: "Basic Shapes",
        parameters: [
          {
            name: "width",
            label: "Width (mm)",
            type: "number",
            min: 10,
            max: 500,
            default: 100,
            step: 5,
            required: true,
          },
          {
            name: "height",
            label: "Height (mm)",
            type: "number",
            min: 10,
            max: 500,
            default: 100,
            step: 5,
            required: true,
          },
          {
            name: "depth",
            label: "Depth (mm)",
            type: "number",
            min: 10,
            max: 500,
            default: 100,
            step: 5,
            required: true,
          },
        ],
      },
    },
  });

  console.log(`✅ Created/Updated product: ${box.name}`);

  console.log("✅ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
