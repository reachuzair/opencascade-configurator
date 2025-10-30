"use client";

import React, { useState } from "react";
import { ProductCatalog } from "@/components/ProductCatalog";
import { DynamicParameterForm } from "@/components/DynamicParameterForm";
import { CADViewer } from "@/components/CADViewer";
import { Product, generateProductModel, GenerateModelResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [parameters, setParameters] = useState<Record<string, unknown>>({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateModelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("catalog");

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setResult(null);
    setError(null);

    // Initialize parameters with defaults
    const initialParams: Record<string, unknown> = {};
    if (product.parametersSchema?.parameters) {
      for (const param of product.parametersSchema.parameters) {
        initialParams[param.name] = param.default;
      }
    }
    setParameters(initialParams);

    // Switch to configurator tab
    setActiveTab("configurator");
  };

  const handleParameterChange = (name: string, value: unknown) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!selectedProduct) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await generateProductModel(
        selectedProduct.id,
        parameters,
        `${selectedProduct.name} ${new Date().toISOString()}`
      );

      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || "Failed to generate model");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (url: string | null | undefined, filename: string) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CAD Configurator
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Parametric 3D Model Generation with Open Cascade
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
            <TabsTrigger value="configurator" disabled={!selectedProduct}>
              Configurator
            </TabsTrigger>
          </TabsList>

          {/* Product Catalog Tab */}
          <TabsContent value="catalog" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select a Product</h2>
                <p className="text-gray-600">Choose a product to configure and generate</p>
              </div>
              <ProductCatalog
                onSelectProduct={handleSelectProduct}
                selectedProductId={selectedProduct?.id}
              />
            </div>
          </TabsContent>

          {/* Configurator Tab */}
          <TabsContent value="configurator" className="mt-6">
            {selectedProduct ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Parameters */}
                <div className="lg:col-span-1 space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(null);
                      setActiveTab("catalog");
                    }}
                    className="mb-4"
                  >
                    ← Back to Catalog
                  </Button>

                  {selectedProduct.parametersSchema?.parameters && (
                    <DynamicParameterForm
                      schema={selectedProduct.parametersSchema}
                      values={parameters}
                      onChange={handleParameterChange}
                      onGenerate={handleGenerate}
                      generating={generating}
                    />
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-semibold text-red-700">Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Download Buttons */}
                  {result?.files && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-green-700 mb-3">
                        ✅ Model Generated Successfully!
                      </p>
                      {result.files.step && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownload(result.files?.step, "model.step")}
                        >
                          📄 Download STEP
                        </Button>
                      )}
                      {result.files.stl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownload(result.files?.stl, "model.stl")}
                        >
                          🔺 Download STL
                        </Button>
                      )}
                      {result.files.dxf && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownload(result.files?.dxf, "model.dxf")}
                        >
                          📐 Download DXF
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: 3D Viewer */}
                <div className="lg:col-span-2">
                  <CADViewer
                    stlUrl={result?.files?.stl}
                    preview={result?.preview}
                    material={String(parameters['material'] || '')}
                  />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-lg">No product selected</p>
                <p className="text-sm text-gray-400 mt-2">
                  Go back to the catalog and select a product to configure.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
