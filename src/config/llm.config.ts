/**
 * Core LLM interfaces and configurations for MindSculpt
 */

/**
 * Supported LLM provider types
 */
export type LLMProviderType = 'openai' | 'anthropic' | 'claude' | 'local' | 'custom';

/**
 * Basic configuration for LLM providers
 */
export interface LLMConfig {
    provider: LLMProviderType;
    apiKey?: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    customOptions?: Record<string, any>;
}

/**
 * Standardized response format
 */
export interface LLMResponse {
    content: string;
    usage?: {
        totalTokens: number;
        promptTokens: number;
        completionTokens: number;
    };
    metadata?: Record<string, any>;
}

/**
 * Message format for LLM requests
 */
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
    metadata?: Record<string, any>;
}

/**
 * Core LLM Provider interface
 */
export interface LLMProvider {
    generateCompletion(messages: LLMMessage[]): Promise<LLMResponse>;
    generateStream?(messages: LLMMessage[]): AsyncIterableIterator<LLMResponse>;
}

/**
 * Default configuration settings
 */
export const DEFAULT_CONFIG: LLMConfig = {
    provider: 'openai',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
};

/**
 * Example OpenAI provider implementation
 */
export class OpenAIProvider implements LLMProvider {
    private config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    async generateCompletion(messages: LLMMessage[]): Promise<LLMResponse> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature
            })
        });

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            usage: {
                totalTokens: data.usage.total_tokens,
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens
            }
        };
    }
}

/**
 * Example mock provider for testing
 */
export class MockLLMProvider implements LLMProvider {
    async generateCompletion(messages: LLMMessage[]): Promise<LLMResponse> {
        return {
            content: "Mock response for testing",
            usage: {
                totalTokens: 10,
                promptTokens: 5,
                completionTokens: 5
            }
        };
    }
}

/**
 * Factory function to create LLM providers
 */
export function createLLMProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
        case 'openai':
            return new OpenAIProvider(config);
        case 'local':
            return new MockLLMProvider();
        default:
            throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
}

/**
 * Example usage:
 * ```typescript
 * // Create a provider
 * const config: LLMConfig = {
 *   provider: 'openai',
 *   apiKey: 'your-api-key',
 *   model: 'gpt-4'
 * };
 * 
 * const llm = createLLMProvider(config);
 * 
 * // Generate completion
 * const response = await llm.generateCompletion([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */