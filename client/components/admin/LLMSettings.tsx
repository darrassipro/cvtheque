'use client';

import React, { useState, useEffect } from 'react';
import {
  useGetLLMConfigsQuery,
  useCreateLLMConfigMutation,
  useUpdateLLMConfigMutation,
  useDeleteLLMConfigMutation,
  useSetDefaultLLMConfigMutation,
  useTestLLMConfigMutation,
  useToggleLLMProcessingMutation,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} from '@/lib/services/adminApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '../ui/switch';
import type { SystemSettings } from '@/types/admin.types';
import { AlertCircle, CheckCircle2, TestTube, Loader2, Plus, Trash2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Provider and Model configuration
const LLM_PROVIDERS = {
  OPENAI: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4-vision'],
  },
  GROK: {
    name: 'Grok',
    models: ['grok-1', 'grok-2'],
  },
  GEMINI: {
    name: 'Google Gemini',
    models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  },
};

export default function LLMSettings() {
  const { data: configsData, isLoading: configsLoading, refetch: refetchConfigs } = useGetLLMConfigsQuery();
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useGetSystemSettingsQuery();
  const [createConfig] = useCreateLLMConfigMutation();
  const [updateConfig] = useUpdateLLMConfigMutation();
  const [deleteConfig] = useDeleteLLMConfigMutation();
  const [setDefault] = useSetDefaultLLMConfigMutation();
  const [testConfig] = useTestLLMConfigMutation();
  const [toggleProcessing] = useToggleLLMProcessingMutation();
  const [updateSettings] = useUpdateSystemSettingsMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [llmEnabled, setLLMEnabled] = useState(false);
  const [maxRetries, setMaxRetries] = useState(3);
  const [processingTimeout, setProcessingTimeout] = useState(120);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    model: '',
    temperature: 0.7,
    apiKey: '',
  });

  const configs = configsData?.data || [];
  const settings: SystemSettings = (settingsData?.data as SystemSettings) || ({} as SystemSettings);

  useEffect(() => {
    if (settings) {
      setLLMEnabled(settings.llmEnabled || false);
      setMaxRetries(settings.maxRetries || 3);
      setProcessingTimeout(settings.processingTimeout || 120);
    }
  }, [settings]);

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      model: '',
      temperature: 0.7,
      apiKey: '',
    });
    setEditingId(null);
    setShowCreateForm(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Configuration name is required';
    }
    if (!formData.provider) {
      newErrors.provider = 'Provider is required';
    }
    if (!formData.model) {
      newErrors.model = 'Model is required';
    }
    if (!editingId && (!formData.apiKey || !formData.apiKey.trim())) {
      newErrors.apiKey = 'API Key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrUpdate = async () => {
    if (!validateForm()) return;

    try {
      // Prepare payload - include apiKey for storage
      const payload: any = {
        name: formData.name.trim(),
        provider: formData.provider,
        model: formData.model,
        temperature: formData.temperature,
        isActive: true,
      };

      // For CREATE: apiKey is required (validated above)
      // For UPDATE: only include if changed
      if (!editingId) {
        // Creating new config - apiKey is required
        payload.apiKey = formData.apiKey.trim();
      } else if (formData.apiKey && formData.apiKey.trim()) {
        // Updating existing config - only if new key provided
        payload.apiKey = formData.apiKey.trim();
      }

      if (editingId) {
        await updateConfig({ id: editingId, ...payload }).unwrap();
      } else {
        await createConfig(payload).unwrap();
      }
      
      await refetchConfigs();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save config:', error);
      alert(error.data?.message || 'Failed to save configuration');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await deleteConfig(id).unwrap();
      await refetchConfigs();
    } catch (error: any) {
      console.error('Failed to delete config:', error);
      alert(error.data?.message || 'Failed to delete configuration');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id).unwrap();
      await refetchConfigs();
      await refetchSettings();
    } catch (error: any) {
      console.error('Failed to set default:', error);
      alert(error.data?.message || 'Failed to set default configuration');
    }
  };

  const handleToggleLLMProcessing = async () => {
    try {
      const newState = !llmEnabled;
      setLLMEnabled(newState);
      await toggleProcessing({ enabled: newState }).unwrap();
      await refetchSettings();
    } catch (error) {
      console.error('Failed to toggle LLM processing:', error);
      setLLMEnabled(!llmEnabled);
    }
  };

  const handleTestConfig = async (id: string) => {
    setTestingId(id);
    setTestResults(prev => ({ ...prev, [id]: { success: false, message: 'Testing...' } }));
    try {
      const response = await testConfig(id).unwrap();
      setTestResults(prev => ({
        ...prev,
        [id]: {
          success: response.success,
          message: response.message || 'Test completed successfully',
        },
      }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [id]: {
          success: false,
          message: error.data?.message || 'Test failed',
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSettings({
        maxRetries,
        processingTimeout,
      }).unwrap();
      await refetchSettings();
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  const getAvailableModels = () => {
    if (!formData.provider) return [];
    const provider = LLM_PROVIDERS[formData.provider as keyof typeof LLM_PROVIDERS];
    if (!provider) return [];
    return provider.models;
  };

  const startEdit = (config: any) => {
    setFormData({
      name: config.name,
      provider: config.provider,
      model: config.model,
      temperature: config.temperature || 0.7,
      apiKey: '',
    });
    setEditingId(config.id);
    setErrors({});
  };

  if (configsLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* LLM Processing Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Processing</CardTitle>
          <CardDescription>Enable or disable LLM processing for CV extraction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">LLM Processing Status</p>
              <p className="text-sm text-gray-500 mt-1">
                {llmEnabled ? '✓ Enabled - CVs will be processed with LLM' : '✗ Disabled - CVs will use basic extraction'}
              </p>
            </div>
            <Switch
              checked={llmEnabled}
              onCheckedChange={handleToggleLLMProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit LLM Config Form */}
      {(showCreateForm || editingId) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit LLM Configuration' : 'Add New LLM Configuration'}</CardTitle>
              <CardDescription>Configure a new LLM provider. API keys are securely stored in the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Configuration Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Production GPT-4"
                    className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="provider" className="text-sm font-semibold">
                    Provider *
                  </Label>
                  <select
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => {
                      setFormData({ ...formData, provider: e.target.value, model: '' });
                      setErrors(prev => ({ ...prev, provider: '', model: '' }));
                    }}
                    className={`mt-1 w-full px-3 py-2 border rounded-md bg-white ${errors.provider ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select a provider</option>
                    {Object.entries(LLM_PROVIDERS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                  </select>
                  {errors.provider && <p className="text-red-600 text-xs mt-1">{errors.provider}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model" className="text-sm font-semibold">
                    Model *
                  </Label>
                    <select
                      id="model"
                      value={formData.model}
                      onChange={(e) => {
                        setFormData({ ...formData, model: e.target.value });
                        setErrors(prev => ({ ...prev, model: '' }));
                      }}
                      disabled={!formData.provider}
                      className={`mt-1 w-full px-3 py-2 border rounded-md bg-white ${
                        !formData.provider ? 'bg-gray-100 cursor-not-allowed' : ''
                      } ${errors.model ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">
                        {!formData.provider ? 'Select a provider first' : 'Select a model'}
                      </option>
                      {getAvailableModels().map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                    {errors.model && <p className="text-red-600 text-xs mt-1">{errors.model}</p>}
                  </div>
                  <div>
                    <Label htmlFor="apiKey" className="text-sm font-semibold">
                      API Key {editingId ? '' : '*'}
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => {
                        setFormData({ ...formData, apiKey: e.target.value });
                        setErrors(prev => ({ ...prev, apiKey: '' }));
                      }}
                      placeholder={editingId ? 'Leave empty to keep existing key' : 'Enter API key'}
                      className={`mt-1 ${errors.apiKey ? 'border-red-500' : ''}`}
                    />
                    {errors.apiKey && <p className="text-red-600 text-xs mt-1">{errors.apiKey}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature" className="text-sm font-semibold">
                    Temperature (0-1)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-600 mt-1">Lower = more focused, Higher = more creative</p>
                </div>
                <div className="pt-6 text-sm text-gray-600">
                  Models may have provider-specific token limits.
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateOrUpdate}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {editingId ? 'Update Configuration' : 'Create Configuration'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LLM Configurations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>LLM Configurations</CardTitle>
            <CardDescription>Manage and test different LLM providers and models</CardDescription>
          </div>
          {!showCreateForm && !editingId && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No LLM configurations found</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Configuration
                </Button>
              </div>
            ) : (
              configs.map((config: any) => (
                <div
                  key={config.id}
                  className="border rounded-lg p-4 space-y-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{config.name}</h3>
                        {config.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Provider: <span className="font-medium">{config.provider}</span> | Model: <span className="font-medium">{config.model}</span>
                      </p>
                    </div>
                  </div>

                  {/* Test Result */}
                  {testResults[config.id] && (
                    <div
                      className={`flex items-start gap-3 p-3 rounded border ${
                        testResults[config.id].success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {testResults[config.id].success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`font-medium text-sm ${
                            testResults[config.id].success ? 'text-green-900' : 'text-red-900'
                          }`}
                        >
                          {testResults[config.id].success ? 'Test Successful' : 'Test Failed'}
                        </p>
                        <p className="text-xs text-gray-700 mt-1">{testResults[config.id].message}</p>
                      </div>
                    </div>
                  )}

                  {/* Config Details */}
                  <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded">
                    <div>
                      <p className="text-gray-600 font-medium">Temperature</p>
                      <p className="text-gray-900">{config.temperature ?? 0.7}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Has API Key</p>
                      <p className="text-gray-900">{config.hasApiKey ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Availability</p>
                      <p className="text-gray-900">{config.isAvailable ? 'Available' : 'Unavailable'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConfig(config.id)}
                      disabled={testingId === config.id}
                    >
                      {testingId === config.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test
                        </>
                      )}
                    </Button>
                    {!config.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(config.id)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(config)}
                    >
                      Edit
                    </Button>
                    {configs.length > 1 && !config.isDefault && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Settings</CardTitle>
          <CardDescription>Configure automatic CV processing behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="maxRetries" className="text-base font-semibold">
                Max Retry Attempts
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                  className="w-32"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateSettings}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Number of times to retry a failed CV processing
              </p>
            </div>

            <div>
              <Label htmlFor="processingTimeout" className="text-base font-semibold">
                Processing Timeout (seconds)
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  id="processingTimeout"
                  type="number"
                  min="30"
                  max="300"
                  value={processingTimeout}
                  onChange={(e) => setProcessingTimeout(parseInt(e.target.value) || 120)}
                  className="w-32"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateSettings}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Maximum time allowed for a single CV processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
