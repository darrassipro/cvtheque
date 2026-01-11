import { Response } from 'express';
import { LLMConfiguration, LLMProvider } from '../models/index.js';
import { AuthenticatedRequest } from '../types/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../middleware/errorHandler.js';
import { logAudit, logSettingsChange } from '../middleware/audit.js';
import { AuditAction } from '../models/AuditLog.js';
import { getLLMService } from '../services/llm/index.js';

const llmService = getLLMService();

/**
 * List all LLM configurations
 */
export async function listLLMConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const configs = await LLMConfiguration.findAll({
    order: [
      ['isDefault', 'DESC'],
      ['provider', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  // Add availability info
  const configsWithStatus = configs.map(config => ({
    ...config.toJSON(),
    isAvailable: llmService.isProviderAvailable(config.provider),
  }));

  res.json({
    success: true,
    data: configsWithStatus,
  });
}

/**
 * Get available LLM providers
 */
export async function getAvailableProviders(req: AuthenticatedRequest, res: Response): Promise<void> {
  const providers = Object.values(LLMProvider).map(provider => ({
    provider,
    isAvailable: llmService.isProviderAvailable(provider),
  }));

  res.json({
    success: true,
    data: {
      providers,
      defaultProvider: llmService.getDefaultProvider(),
    },
  });
}

/**
 * Get a single LLM configuration
 */
export async function getLLMConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const config = await LLMConfiguration.findByPk(id);
  if (!config) {
    throw new NotFoundError('LLM Configuration');
  }

  res.json({
    success: true,
    data: {
      ...config.toJSON(),
      isAvailable: llmService.isProviderAvailable(config.provider),
    },
  });
}

/**
 * Create a new LLM configuration
 */
export async function createLLMConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  const {
    name,
    provider,
    model,
    isDefault,
    isActive,
    temperature,
    maxTokens,
    topP,
    extractionStrictness,
    extractionPrompt,
    summaryPrompt,
  } = req.body;

  // Check if name is unique
  const existing = await LLMConfiguration.findOne({ where: { name } });
  if (existing) {
    throw new ConflictError('A configuration with this name already exists');
  }

  // Validate provider is available
  if (!llmService.isProviderAvailable(provider)) {
    throw new ValidationError(`Provider ${provider} is not configured or unavailable`);
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await LLMConfiguration.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
  }

  const config = await LLMConfiguration.create({
    name,
    provider,
    model,
    isDefault: isDefault || false,
    isActive: isActive !== false,
    temperature: temperature ?? 0.1,
    maxTokens: maxTokens ?? 4096,
    topP: topP ?? 0.95,
    extractionStrictness: extractionStrictness || 'strict',
    extractionPrompt,
    summaryPrompt,
  });

  // Update default provider if this is the new default
  if (config.isDefault) {
    llmService.setDefaultProvider(config.provider);
  }

  await logAudit(req, AuditAction.CREATE, 'llm_configuration', config.id);

  res.status(201).json({
    success: true,
    message: 'LLM configuration created successfully',
    data: config,
  });
}

/**
 * Update an LLM configuration
 */
export async function updateLLMConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const {
    name,
    model,
    isDefault,
    isActive,
    temperature,
    maxTokens,
    topP,
    extractionStrictness,
    extractionPrompt,
    summaryPrompt,
  } = req.body;

  const config = await LLMConfiguration.findByPk(id);
  if (!config) {
    throw new NotFoundError('LLM Configuration');
  }

  // Check name uniqueness if changed
  if (name && name !== config.name) {
    const existing = await LLMConfiguration.findOne({ where: { name } });
    if (existing) {
      throw new ConflictError('A configuration with this name already exists');
    }
  }

  // If setting as default, unset other defaults
  if (isDefault && !config.isDefault) {
    await LLMConfiguration.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
  }

  // Track changes for audit
  const oldValues = config.toJSON();

  await config.update({
    ...(name && { name }),
    ...(model && { model }),
    ...(isDefault !== undefined && { isDefault }),
    ...(isActive !== undefined && { isActive }),
    ...(temperature !== undefined && { temperature }),
    ...(maxTokens !== undefined && { maxTokens }),
    ...(topP !== undefined && { topP }),
    ...(extractionStrictness && { extractionStrictness }),
    ...(extractionPrompt !== undefined && { extractionPrompt }),
    ...(summaryPrompt !== undefined && { summaryPrompt }),
  });

  // Update default provider if this is the new default
  if (config.isDefault) {
    llmService.setDefaultProvider(config.provider);
  }

  await logSettingsChange(req, `llm_config_${config.id}`, oldValues, config.toJSON());

  res.json({
    success: true,
    message: 'LLM configuration updated successfully',
    data: config,
  });
}

/**
 * Delete an LLM configuration
 */
export async function deleteLLMConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const config = await LLMConfiguration.findByPk(id);
  if (!config) {
    throw new NotFoundError('LLM Configuration');
  }

  if (config.isDefault) {
    throw new ValidationError('Cannot delete the default configuration. Set another as default first.');
  }

  await logAudit(req, AuditAction.DELETE, 'llm_configuration', config.id);

  await config.destroy();

  res.json({
    success: true,
    message: 'LLM configuration deleted successfully',
  });
}

/**
 * Set a configuration as default
 */
export async function setDefaultLLMConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const config = await LLMConfiguration.findByPk(id);
  if (!config) {
    throw new NotFoundError('LLM Configuration');
  }

  if (!config.isActive) {
    throw new ValidationError('Cannot set inactive configuration as default');
  }

  if (!llmService.isProviderAvailable(config.provider)) {
    throw new ValidationError(`Provider ${config.provider} is not available`);
  }

  // Unset current default
  await LLMConfiguration.update(
    { isDefault: false },
    { where: { isDefault: true } }
  );

  // Set new default
  await config.update({ isDefault: true });

  // Update LLM service default
  llmService.setDefaultProvider(config.provider);

  await logSettingsChange(req, 'default_llm_config', null, config.id);

  res.json({
    success: true,
    message: 'Default configuration updated',
    data: config,
  });
}

/**
 * Test an LLM configuration
 */
export async function testLLMConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.params.id as string;

  const config = await LLMConfiguration.findByPk(id);
  if (!config) {
    throw new NotFoundError('LLM Configuration');
  }

  if (!llmService.isProviderAvailable(config.provider)) {
    res.json({
      success: false,
      data: {
        available: false,
        error: `Provider ${config.provider} is not configured`,
      },
    });
    return;
  }

  try {
    // Simple test prompt
    const response = await llmService.generateCompletion(
      {
        prompt: 'Respond with exactly: "LLM connection successful"',
        maxTokens: 50,
      },
      config
    );

    res.json({
      success: true,
      data: {
        available: true,
        response: response.content,
        model: response.model,
        provider: response.provider,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}