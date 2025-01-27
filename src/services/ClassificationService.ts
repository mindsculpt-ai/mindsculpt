import { MemoryClassification } from '../types/memory.types';

/**
 * Extended classification interface including narrative elements
 */
export interface NarrativeClassification extends MemoryClassification {
    observation: string;
    user_state?: string;
    scene_details?: string;
    glimpse_id?: string;
}

/**
 * Interface for LLM providers
 */
export interface LLMProvider {
    generateCompletion(prompt: string): Promise<string>;
}

/**
 * Example OpenAI provider implementation
 */
export class OpenAIProvider implements LLMProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model = 'gpt-4o') {
        this.apiKey = apiKey;
        this.model = model;
    }

    public async generateCompletion(prompt: string): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 500
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

/**
 * Example mock provider for testing
 */
export class MockLLMProvider implements LLMProvider {
    public async generateCompletion(): Promise<string> {
        return JSON.stringify({
            observation: "Mock observation of user interaction",
            user_state: "Neutral, engaging in conversation",
            scene_details: "Standard interaction context",
            importance: 0.5,
            emotion_score: 0,
            focus_area: "general",
            interaction_type: "general",
            suggested_links: []
        });
    }
}

export class ClassificationService {
    private llmProvider: LLMProvider;

    constructor(llmProvider: LLMProvider) {
        this.llmProvider = llmProvider;
    }

    /**
     * Classify text using LLM provider
     */
    private async classifyWithLLM(text: string, userContext?: string): Promise<NarrativeClassification> {
        const contextPrompt = userContext
            ? `User message: "${userContext}"\nAI response: "${text}"`
            : `Text to analyze: "${text}"`;

        const prompt = `Analyze the following interaction and provide a JSON response. Only respond with valid JSON, no markdown:
    {
      "observation": "Write a narrative description of the interaction, including behavioral and emotional observations",
      "user_state": "A simple string describing user's emotional and behavioral state",
      "scene_details": "A simple string describing contextual and environmental details",
      "importance": 0.5,
      "emotion_score": 0,
      "focus_area": "general",
      "interaction_type": "general",
      "suggested_links": []
    }
    
    ${contextPrompt}
    `;

        try {
            const response = await this.llmProvider.generateCompletion(prompt);
            const result = JSON.parse(response);

            return {
                observation: result.observation || 'User and AI engaged in conversation.',
                user_state: result.user_state || 'Neutral, engaging in conversation',
                scene_details: result.scene_details || 'The interaction is at an early stage, with no specific context established yet.',
                importance: this.clamp(result.importance || 0.5, 0, 1),
                emotion_score: this.clamp(result.emotion_score || 0, -1, 1),
                focus_area: result.focus_area || 'general',
                interaction_type: result.interaction_type || 'general',
                suggested_links: Array.isArray(result.suggested_links) ? result.suggested_links : []
            };
        } catch (error) {
            console.error('Error in classification:', error);
            return this.getDefaultClassification();
        }
    }

    /**
     * Clamp a value between min and max
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Get default classification values
     */
    private getDefaultClassification(): NarrativeClassification {
        return {
            observation: '',
            importance: 0.5,
            emotion_score: 0,
            focus_area: 'general',
            interaction_type: 'general',
            suggested_links: []
        };
    }

    /**
     * Classify a single memory text
     */
    public async classifyMemory(text: string, userContext?: string): Promise<NarrativeClassification> {
        try {
            return await this.classifyWithLLM(text, userContext);
        } catch (error) {
            console.error('Error in memory classification:', error);
            return this.getDefaultClassification();
        }
    }

    /**
     * Classify multiple texts in batch
     */
    public async classifyBatch(texts: string[]): Promise<MemoryClassification[]> {
        return Promise.all(texts.map(text => this.classifyMemory(text)));
    }

    /**
     * Analyze similarity between two texts
     */
    public async analyzeSimilarity(text1: string, text2: string): Promise<number> {
        try {
            const prompt = `Compare these two texts and rate their similarity from 0 to 1, where 1 means identical in meaning and 0 means completely unrelated:

Text 1: "${text1}"
Text 2: "${text2}"

Respond with only a number between 0 and 1.`;

            const response = await this.llmProvider.generateCompletion(prompt);
            const similarity = parseFloat(response);
            return this.clamp(similarity, 0, 1);
        } catch (error) {
            console.error('Error in similarity analysis:', error);
            return 0;
        }
    }
}

/**
 * Example usage:
 * 
 * ```typescript
 * // Create an LLM provider
 * const llmProvider = new OpenAIProvider('your-api-key');
 * 
 * // Initialize classification service
 * const classifier = new ClassificationService(llmProvider);
 * 
 * // Classify a memory
 * const classification = await classifier.classifyMemory(
 *   "User expressed excitement about the new feature"
 * );
 * ```
 */