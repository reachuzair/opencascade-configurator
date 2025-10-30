"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ParameterDefinition {
    name: string;
    label: string;
    type: "number" | "string" | "select" | "boolean";
    min?: number;
    max?: number;
    default: unknown;
    step?: number;
    options?: string[];
    required?: boolean;
    unit?: string;
}

interface ParameterSchema {
    product_id: string;
    name: string;
    category?: string;
    parameters: ParameterDefinition[];
}

interface DynamicParameterFormProps {
    schema: ParameterSchema;
    values: Record<string, unknown>;
    onChange: (name: string, value: unknown) => void;
    onGenerate: () => void;
    generating?: boolean;
}

export function DynamicParameterForm({
    schema,
    values,
    onChange,
    onGenerate,
    generating = false,
}: DynamicParameterFormProps) {
    const renderParameter = (param: ParameterDefinition) => {
        const value = values[param.name] ?? param.default;

        if (param.type === "number") {
            const numValue = typeof value === 'number' ? value : Number(value) || 0;
            return (
                <div key={param.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={param.name}>
                            {param.label}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <span className="text-sm text-gray-600">
                            {numValue}
                            {param.unit && ` ${param.unit}`}
                        </span>
                    </div>

                    {param.min !== undefined && param.max !== undefined ? (
                        <>
                            <Slider
                                id={param.name}
                                min={param.min}
                                max={param.max}
                                step={param.step || 1}
                                value={[numValue]}
                                onValueChange={([newValue]) => onChange(param.name, newValue)}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{param.min}</span>
                                <span>{param.max}</span>
                            </div>
                        </>
                    ) : (
                        <Input
                            id={param.name}
                            type="number"
                            value={numValue}
                            onChange={(e) => onChange(param.name, parseFloat(e.target.value))}
                            step={param.step}
                            min={param.min}
                            max={param.max}
                        />
                    )}
                </div>
            );
        }

        if (param.type === "select" && param.options) {
            const strValue = String(value);
            return (
                <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>
                        {param.label}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <select
                        id={param.name}
                        value={strValue}
                        onChange={(e) => onChange(param.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={param.label}
                    >
                        {param.options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (param.type === "boolean") {
            const boolValue = Boolean(value);
            return (
                <div key={param.name} className="flex items-center space-x-2">
                    <input
                        aria-label={param.label}
                        id={param.name}
                        type="checkbox"
                        checked={boolValue}
                        onChange={(e) => onChange(param.name, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor={param.name}>{param.label}</Label>
                </div>
            );
        }

        // Default: string input
        const strValue = String(value);
        return (
            <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name}>
                    {param.label}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                    id={param.name}
                    type="text"
                    value={strValue}
                    onChange={(e) => onChange(param.name, e.target.value)}
                />
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parameters</CardTitle>
                <CardDescription>
                    Configure the parameters for {schema.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {schema.parameters.map(renderParameter)}

                <Button onClick={onGenerate} disabled={generating} className="w-full" size="lg">
                    {generating ? (
                        <>
                            <span className="animate-spin mr-2">⚙️</span>
                            Generating...
                        </>
                    ) : (
                        <>
                            <span className="mr-2">🚀</span>
                            Generate Model
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

