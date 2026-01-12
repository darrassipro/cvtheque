export enum LLMProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  GROK = 'grok',
}

export interface LLMConfig {
  id: string;
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isActive: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLLMConfigData {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateLLMConfigData {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
  priority?: number;
}

export interface TestLLMConfigData {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}

export interface TestLLMConfigResponse {
  success: boolean;
  message: string;
  data?: {
    provider: LLMProvider;
    model: string;
    responseTime: number;
  };
}
