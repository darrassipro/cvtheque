import OpenAI from 'openai';
import { LLMRequest, LLMResponse } from '../../types/index.js';
import { LLMProvider } from '../../models/index.js';
import { BaseLLMProvider } from './base.js';
import { logger } from '../../utils/logger.js';

/**
 * OpenAI LLM Provider
 */
export class OpenAIProvider extends BaseLLMProvider {
  provider = LLMProvider.OPENAI;
  private client: OpenAI | null = null;
  private currentModelName: string = 'gpt-4o-mini';

  constructor() {
    super();
  }

  configure(apiKey: string): void {
    try {
      this.client = new OpenAI({ apiKey });
      logger.info('OpenAI provider configured from DB');
    } catch (error) {
      logger.error('Failed to configure OpenAI provider:', error);
      this.client = null;
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Set the model to use
   */
  setModel(modelName: string): void {
    this.currentModelName = modelName;
  }

  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('OpenAI provider not initialized');
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }

      messages.push({ role: 'user', content: request.prompt });

      const response = await this.client.chat.completions.create({
        model: this.currentModelName,
        messages,
        temperature: request.temperature ?? 0.1,
        max_tokens: request.maxTokens ?? 4096,
        top_p: request.topP ?? 0.95,
      });

      const choice = response.choices[0];
      const content = choice.message.content || '';

      return {
        content,
        model: this.currentModelName,
        provider: 'openai',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      logger.error('OpenAI completion error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
let openaiProvider: OpenAIProvider | null = null;

export function getOpenAIProvider(): OpenAIProvider {
  if (!openaiProvider) {
    openaiProvider = new OpenAIProvider();
  }
  return openaiProvider;
}