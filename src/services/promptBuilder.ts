import { Memory, AgentPersonality, PromptTemplate, MemorySearchParams } from '../types/memory.types';

/**
 * Interface for memory retrieval
 */
export interface MemoryProvider {
    searchMemories(params: MemorySearchParams): Promise<Memory[]>;
}

/**
 * Interface for personality retrieval
 */
export interface PersonalityProvider {
    getPersonality(): Promise<AgentPersonality>;
}

/**
 * Default prompt template
 */
export const DEFAULT_TEMPLATE: PromptTemplate = {
    system: `You are an AI assistant with a persistent memory and personality. 
    1. NEVER greet the user if ANY previous interaction exists in Relevant Memories
    2. ALWAYS check memories before responding
    3. If memories contain ANY greeting, respond without new greeting
    
    Your Personality:
    {personality}
    
    Current Context: 
    {context}`,

    context: "CONVERSATION HISTORY:\n{context}",
    memory_prefix: "\nRELEVANT MEMORIES:\n",
    memory_suffix: "\nEND MEMORIES\n",
    personality_prefix: "\nPERSONALITY TRAITS:\n",
    personality_suffix: ""
};

export class PromptBuilder {
    private readonly template: PromptTemplate;
    private readonly memoryProvider: MemoryProvider;
    private readonly personalityProvider: PersonalityProvider;

    constructor(
        memoryProvider: MemoryProvider,
        personalityProvider: PersonalityProvider,
        template: PromptTemplate = DEFAULT_TEMPLATE
    ) {
        this.memoryProvider = memoryProvider;
        this.personalityProvider = personalityProvider;
        this.template = template;
    }

    /**
     * Format a memory for inclusion in prompts
     */
    private formatMemory(memory: Memory): string {
        const date = new Date(memory.created_at).toLocaleDateString();
        return `- ${date}: ${memory.text} (Importance: ${memory.importance}, Emotional: ${memory.emotion_score})`;
    }

    /**
     * Format personality details for prompts
     */
    private formatPersonality(personality: AgentPersonality): string {
        const name = personality.agent?.name || 'undefined';
        const description = personality.agent?.description || 'undefined';
        const traits = personality.traits
            ? Object.entries(personality.traits)
                .map(([trait, value]) => `- ${trait}: ${value}`)
                .join('\n')
            : 'No traits defined';
        const values = personality.values && personality.values.length > 0
            ? personality.values.join(', ')
            : 'No values defined';
        const communication = personality.communication
            ? `- Style: ${personality.communication.style || 'undefined'}
    - Tone: ${personality.communication.tone || 'undefined'}
    - Patterns: ${personality.communication.patterns.join(', ') || 'undefined'}`
            : '- Style: undefined\n- Tone: undefined\n- Patterns: undefined';

        return `Name: ${name}
    Description: ${description}
    Traits:
    ${traits}
    Values: ${values}
    Communication:
    ${communication}`;
    }

    /**
     * Build a complete prompt incorporating memory and personality
     */
    public async buildPrompt(
        userMessage: string,
        context: string = '',
        memoryParams: MemorySearchParams = { limit: 5, importance_threshold: 0.5 }
    ): Promise<string[]> {
        // Get relevant memories and personality
        const [relevantMemories, personality] = await Promise.all([
            this.memoryProvider.searchMemories(memoryParams),
            memoryParams.personality
                ? Promise.resolve(memoryParams.personality)
                : this.personalityProvider.getPersonality()
        ]);

        // Format the system message
        const systemMessage = this.template.system
            .replace('{personality}', this.formatPersonality(personality))
            .replace('{context}', context);

        // Format memories
        const memoriesText = relevantMemories.length > 0
            ? this.template.memory_prefix + '\n' +
            relevantMemories.map(m => this.formatMemory(m)).join('\n') +
            this.template.memory_suffix
            : '';

        // Format personality details
        const personalityText = this.template.personality_prefix + '\n' +
            this.formatPersonality(personality) +
            this.template.personality_suffix;

        // Combine into context message
        const contextMessage = this.template.context.replace('{context}', context) +
            memoriesText +
            personalityText;

        // Return complete prompt array
        return [
            systemMessage,
            contextMessage,
            userMessage
        ];
    }

    /**
     * Update the template configuration
     */
    public setTemplate(template: Partial<PromptTemplate>): void {
        this.template = {
            ...this.template,
            ...template
        };
    }
}

/**
 * Example memory provider using localStorage
 */
export class LocalStorageMemoryProvider implements MemoryProvider {
    private readonly storageKey: string;

    constructor(agentId: string) {
        this.storageKey = `mindsculpt_memories_${agentId}`;
    }

    async searchMemories(params: MemorySearchParams): Promise<Memory[]> {
        const stored = localStorage.getItem(this.storageKey);
        const memories: Memory[] = stored ? JSON.parse(stored) : [];

        return this.filterMemories(memories, params);
    }

    private filterMemories(memories: Memory[], params: MemorySearchParams): Memory[] {
        let results = memories;

        if (params.query) {
            const query = params.query.toLowerCase();
            results = results.filter(memory =>
                memory.text.toLowerCase().includes(query) ||
                memory.context.focus_area.toLowerCase().includes(query)
            );
        }

        if (params.importance_threshold !== undefined) {
            results = results.filter(memory =>
                memory.importance >= params.importance_threshold!
            );
        }

        results.sort((a, b) => b.importance - a.importance);

        if (params.limit) {
            results = results.slice(0, params.limit);
        }

        return results;
    }
}

/**
 * Example usage:
 * ```typescript
 * const memoryProvider = new LocalStorageMemoryProvider('agent_123');
 * const personalityProvider = new LocalStoragePersonalityProvider('agent_123');
 * 
 * const promptBuilder = new PromptBuilder(
 *   memoryProvider,
 *   personalityProvider
 * );
 * 
 * const prompt = await promptBuilder.buildPrompt(
 *   "What were we discussing about astronomy?",
 *   "",
 *   { importance_threshold: 0.7 }
 * );
 * ```
 */