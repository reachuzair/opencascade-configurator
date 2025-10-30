'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Trash2, RefreshCw } from 'lucide-react';
import { API_URL } from '@/const';

interface Configuration {
    id: number;
    name: string;
    modelType: string;
    parameters: any;
    createdAt: string;
    updatedAt: string;
}

interface ConfigManagerProps {
    currentConfig: any;
    onLoad: (config: any) => void;
}

export default function ConfigManager({ currentConfig, onLoad }: ConfigManagerProps) {
    const [configs, setConfigs] = useState<Configuration[]>([]);
    const [configName, setConfigName] = useState('');
    const [loading, setLoading] = useState(false);

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/geometry/configurations`);
            const data = await response.json();
            if (data.success) {
                setConfigs(data.configurations);
            }
        } catch (error) {
            console.error('Failed to load configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfigurations();
    }, []);

    const saveConfiguration = async () => {
        if (!configName.trim()) {
            alert('Please enter a configuration name');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/geometry/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shape: currentConfig,
                    name: configName,
                    saveConfig: true,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setConfigName('');
                await loadConfigurations();
                alert('Configuration saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save configuration:', error);
            alert('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const deleteConfiguration = async (id: number) => {
        if (!confirm('Delete this configuration?')) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/geometry/configurations/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await loadConfigurations();
            }
        } catch (error) {
            console.error('Failed to delete configuration:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadConfiguration = (config: Configuration) => {
        onLoad(config.parameters);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Save & Load Configurations</CardTitle>
                <CardDescription>Save your current design or load a previous one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Save Section */}
                <div className="space-y-2">
                    <Label htmlFor="config-name">Configuration Name</Label>
                    <div className="flex gap-2">
                        <Input
                            id="config-name"
                            value={configName}
                            onChange={(e) => setConfigName(e.target.value)}
                            placeholder="My Design"
                            disabled={loading}
                        />
                        <Button onClick={saveConfiguration} disabled={loading || !configName.trim()}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>

                {/* Load Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Saved Configurations</Label>
                        <Button variant="ghost" size="sm" onClick={loadConfigurations} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {configs.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No saved configurations</p>
                        ) : (
                            configs.map((config) => (
                                <div
                                    key={config.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                                >
                                    <div className="flex-1 cursor-pointer" onClick={() => loadConfiguration(config)}>
                                        <p className="font-medium">{config.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {config.modelType} • {new Date(config.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConfiguration(config.id);
                                        }}
                                        disabled={loading}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

