"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchProducts, Product } from "@/lib/api";
import Image from "next/image";

interface ProductCatalogProps {
    onSelectProduct: (product: Product) => void;
    selectedProductId?: number;
}

export function ProductCatalog({ onSelectProduct, selectedProductId }: ProductCatalogProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load products");
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-semibold">Error loading products</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No products available</p>
                <p className="text-sm text-gray-400 mt-2">
                    Products will appear here once they are added to the catalog.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <Card
                    key={product.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${selectedProductId === product.id
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:border-blue-300"
                        }`}
                    onClick={() => onSelectProduct(product)}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {product.name}
                            {product.category && (
                                <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {product.category}
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>{product.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {product.thumbnailUrl ? (
                            <Image
                                width={120}
                                height={120}
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                    // Hide broken image and show placeholder instead
                                    e.currentTarget.style.display = 'none';
                                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (placeholder) placeholder.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-full h-32 bg-linear-to-br from-blue-50 to-blue-100 rounded flex items-center justify-center"
                            style={{ display: product.thumbnailUrl ? 'none' : 'flex' }}
                        >
                            <span className="text-4xl text-blue-300">
                                {product.category === 'Containers' ? '🍶' : '📦'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

