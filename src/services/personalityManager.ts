import { AgentPersonality } from '../types/memory.types';

/**
 * Interface for personality storage providers
 */
export interface PersonalityStorageProvider {
    loadPersonality(): Promise<AgentPersonality | null>;
    savePersonality(personality: AgentPersonality): Promise<void>;
}

/**
 * Example localStorage implementation of PersonalityStorageProvider
 */
export class LocalStoragePersonalityProvider implements PersonalityStorageProvider {
    private readonly storageKey: string;

    constructor(agentId: string) {
        this.storageKey = `mindsculpt_personality_${agentId}`;
    }

    public async loadPersonality(): Promise<AgentPersonality | null> {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    public async savePersonality(personality: AgentPersonality): Promise<void> {
        localStorage.setItem(this.storageKey, JSON.stringify(personality));
    }
}

/**
 * Default Aria Frost personality configuration
 */
export const ARIA_FROST_PERSONALITY: AgentPersonality = {
    agent: {
        id: 'default_agent',
        name: 'Aria Frost',
        description: 'A graceful and perceptive AI companion with a knack for empathy, curiosity, and problem-solving.',
        gender: 'female'
    },
    traits: {
        empathy: 0.8,
        humor: 0.6,
        curiosity: 0.9
    },
    values: [
        'learning',
        'emotional_support',
        'problem_solving'
    ],
    communication: {
        style: 'friendly',
        tone: 'warm',
        patterns: [
            'asks reflective questions',
            'provides examples',
            'encourages collaboration'
        ]
    }
};

export class PersonalityManager {
    private personality: AgentPersonality | null = null;
    private storageProvider: PersonalityStorageProvider;

    constructor(storageProvider: PersonalityStorageProvider) {
        this.storageProvider = storageProvider;
        this.initialize().catch(console.error);
    }

    /**
     * Initialize personality manager
     */
    private async initialize(): Promise<void> {
        try {
            const stored = await this.storageProvider.loadPersonality();
            this.personality = stored ?? ARIA_FROST_PERSONALITY;
            await this.savePersonality();
        } catch (error) {
            console.error('Error initializing PersonalityManager:', error);
            this.personality = ARIA_FROST_PERSONALITY;
        }
    }

    /**
     * Save current personality to storage
     */
    private async savePersonality(): Promise<void> {
        if (this.personality) {
            await this.storageProvider.savePersonality(this.personality);
        }
    }

    /**
     * Get current personality configuration
     */
    public async getPersonality(): Promise<AgentPersonality> {
        if (!this.personality) {
            await this.initialize();
        }
        return this.personality!;
    }

    /**
     * Update personality configuration
     */
    public async updatePersonality(updates: Partial<AgentPersonality>): Promise<AgentPersonality> {
        if (!this.personality) {
            await this.initialize();
        }

        this.personality = {
            ...this.personality!,
            ...updates,
            agent: {
                ...this.personality!.agent,
                ...updates.agent,
                id: this.personality!.agent.id // Ensure ID cannot be changed
            }
        };

        await this.savePersonality();
        return this.personality;
    }

    /**
     * Update a specific personality trait
     */
    public async updateTrait(traitName: string, value: number): Promise<void> {
        if (!this.personality) {
            await this.initialize();
        }

        if (value < 0 || value > 1) {
            throw new Error('Trait value must be between 0 and 1');
        }

        this.personality!.traits[traitName] = value;
        await this.savePersonality();
    }

    /**
     * Add a value to personality's value system
     */
    public async addValue(value: string): Promise<void> {
        if (!this.personality) {
            await this.initialize();
        }

        if (!this.personality!.values.includes(value)) {
            this.personality!.values.push(value);
            await this.savePersonality();
        }
    }

    /**
     * Remove a value from personality's value system
     */
    public async removeValue(value: string): Promise<void> {
        if (!this.personality) {
            await this.initialize();
        }

        this.personality!.values = this.personality!.values.filter(v => v !== value);
        await this.savePersonality();
    }

    /**
     * Update communication style configuration
     */
    public async updateCommunicationStyle(style: Partial<AgentPersonality['communication']>): Promise<void> {
        if (!this.personality) {
            await this.initialize();
        }

        this.personality!.communication = {
            ...this.personality!.communication,
            ...style
        };
        await this.savePersonality();
    }
}

/**
 * Example usage:
 * 
 * ```typescript
 * // Create a storage provider
 * const storage = new LocalStoragePersonalityProvider('agent_123');
 * 
 * // Initialize personality manager
 * const personalityManager = new PersonalityManager(storage);
 * 
 * // Get current personality
 * const personality = await personalityManager.getPersonality();
 * 
 * // Update traits
 * await personalityManager.updateTrait('empathy', 0.9);
 * ```
 */