import { config } from '../../config/index.js';
import { LLMConfiguration, LLMProvider } from '../../models/index.js';
import { CVExtractionResponse, LLMRequest, LLMResponse } from '../../types/index.js';
import { BaseLLMProvider, type ILLMProvider } from './base.js';
import { getGeminiProvider } from './gemini.js';
import { getOpenAIProvider } from './openai.js';
import { getGrokProvider } from './grok.js';
import { logger } from '../../utils/logger.js';

export type { ILLMProvider } from './base.js';
export * from './prompts.js';

/**
 * LLM Service - Pluggable LLM orchestration
 * Supports multiple providers: Gemini, OpenAI, Grok
 */
class LLMService {
  private providers: Map<LLMProvider, ILLMProvider> = new Map();
  private defaultProvider: LLMProvider;

  constructor() {
    this.defaultProvider = this.mapConfigProvider(config.llm.defaultProvider);
    this.initializeProviders();
  }

  private mapConfigProvider(provider: string): LLMProvider {
    switch (provider.toLowerCase()) {
      case 'gemini': return LLMProvider.GEMINI;
      case 'openai': return LLMProvider.OPENAI;
      case 'grok': return LLMProvider.GROK;
      default: return LLMProvider.GEMINI;
    }
  }

  private initializeProviders(): void {
    // Initialize all available providers
    const gemini = getGeminiProvider();
    if (gemini.isAvailable()) {
      this.providers.set(LLMProvider.GEMINI, gemini);
    }

    const openai = getOpenAIProvider();
    if (openai.isAvailable()) {
      this.providers.set(LLMProvider.OPENAI, openai);
    }

    const grok = getGrokProvider();
    if (grok.isAvailable()) {
      this.providers.set(LLMProvider.GROK, grok);
    }

    logger.info(`LLM Service initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`);
  }

  /**
   * Get a specific provider
   */
  getProvider(provider?: LLMProvider): ILLMProvider {
    const targetProvider = provider || this.defaultProvider;
    const llmProvider = this.providers.get(targetProvider);
    
    if (!llmProvider) {
      // Try fallback to any available provider
      const availableProvider = this.providers.values().next().value;
      if (availableProvider) {
        logger.warn(`Provider ${targetProvider} not available, falling back to ${availableProvider.provider}`);
        return availableProvider;
      }
      throw new Error(`No LLM provider available. Requested: ${targetProvider}`);
    }
    
    return llmProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a specific provider is available
   */
  isProviderAvailable(provider: LLMProvider): boolean {
    return this.providers.has(provider) && this.providers.get(provider)!.isAvailable();
  }

  /**
   * Generate a completion using the specified or default provider
   */
  async generateCompletion(
    request: LLMRequest, 
    llmConfig?: LLMConfiguration
  ): Promise<LLMResponse> {
    const provider = llmConfig 
      ? this.getProvider(llmConfig.provider)
      : this.getProvider();

    // Apply model from config if available
    if (llmConfig?.model && 'setModel' in provider) {
      (provider as any).setModel(llmConfig.model);
    }

    return provider.generateCompletion({
      ...request,
      temperature: request.temperature ?? llmConfig?.temperature,
      maxTokens: request.maxTokens ?? llmConfig?.maxTokens,
      topP: request.topP ?? llmConfig?.topP,
    });
  }

  /**
   * Extract structured data from CV text
   */
  async extractCVData(
    cvText: string, 
    llmConfig?: LLMConfiguration
  ): Promise<{ result: CVExtractionResponse; provider: string; model: string }> {
    const provider = llmConfig 
      ? this.getProvider(llmConfig.provider)
      : this.getProvider();

    // Apply model from config if available
    if (llmConfig?.model && 'setModel' in provider) {
      (provider as any).setModel(llmConfig.model);
    }

    const result = await provider.extractCVData(cvText, llmConfig);
    
    return {
      result,
      provider: provider.provider,
      model: llmConfig?.model || 'default',
    };
  }

  /**
   * Generate a professional summary from extracted CV data
   */
  async generateSummary(
    extractedData: object, 
    llmConfig?: LLMConfiguration
  ): Promise<string> {
    const provider = llmConfig 
      ? this.getProvider(llmConfig.provider)
      : this.getProvider();

    if (llmConfig?.model && 'setModel' in provider) {
      (provider as any).setModel(llmConfig.model);
    }

    return provider.generateSummary(extractedData, llmConfig);
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(provider: LLMProvider): void {
    if (!this.isProviderAvailable(provider)) {
      throw new Error(`Provider ${provider} is not available`);
    }
    this.defaultProvider = provider;
    logger.info(`Default LLM provider set to: ${provider}`);
  }

  /**
   * Get the current default provider
   */
  getDefaultProvider(): LLMProvider {
    return this.defaultProvider;
  }
}

// Singleton instance
let llmService: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!llmService) {
    llmService = new LLMService();
  }
  return llmService;
}

export { LLMService };