import { EventEmitter } from 'events';
import { Memory, MemorySearchParams, MemoryUpdateEvent } from '../types/memory.types';

/**
 * Interface for memory storage providers
 */
export interface MemoryStorageProvider {
    loadMemories(): Promise<Memory[]>;
    saveMemories(memories: Memory[]): Promise<void>;
}

/**
 * Example localStorage implementation of MemoryStorageProvider
 */
export class LocalStorageProvider implements MemoryStorageProvider {
    private readonly storageKey: string;

    constructor(agentId: string) {
        this.storageKey = `mindsculpt_memories_${agentId}`;
    }

    public async loadMemories(): Promise<Memory[]> {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    public async saveMemories(memories: Memory[]): Promise<void> {
        localStorage.setItem(this.storageKey, JSON.stringify(memories));
    }
}

export class MemoryManager extends EventEmitter {
    private memories: Map<string, Memory> = new Map();
    private storageProvider: MemoryStorageProvider;

    constructor(storageProvider: MemoryStorageProvider) {
        super();
        this.storageProvider = storageProvider;
        this.initialize().catch(console.error);
    }

    /**
     * Initialize the memory manager by loading memories from storage
     */
    private async initialize(): Promise<void> {
        try {
            const memoriesArray = await this.storageProvider.loadMemories();
            this.memories.clear();
            memoriesArray.forEach(memory => this.memories.set(memory.id, memory));
        } catch (error) {
            console.error('Error initializing MemoryManager:', error);
            throw error;
        }
    }

    /**
     * Save current memories to storage
     */
    private async saveMemories(): Promise<void> {
        const memoriesArray = Array.from(this.memories.values());
        await this.storageProvider.saveMemories(memoriesArray);
    }

    /**
     * Generate a unique glimpse ID for memory reference
     */
    private generateGlimpseId(): string {
        return `>gl${Math.random().toString(16).substring(2, 10)}`;
    }

    /**
     * Create a new memory
     */
    public async createMemory(memory: Omit<Memory, 'id' | 'created_at' | 'glimpse_id'>): Promise<Memory> {
        const newMemory: Memory = {
            ...memory,
            id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            glimpse_id: this.generateGlimpseId(),
            created_at: Date.now(),
            linked_memories: memory.linked_memories || [],
            observation: memory.observation || '',
            conversation: memory.conversation || {
                agent_messages: [],
                user_messages: []
            }
        };

        this.memories.set(newMemory.id, newMemory);
        await this.saveMemories();

        const event: MemoryUpdateEvent = {
            type: 'create',
            memory: newMemory,
        };
        this.emit('memoryUpdate', event);

        return newMemory;
    }

    /**
     * Update an existing memory
     */
    public async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
        const memory = this.memories.get(id);
        if (!memory) {
            throw new Error(`Memory with id ${id} not found`);
        }

        const updatedMemory: Memory = {
            ...memory,
            ...updates,
            id, // Ensure id cannot be changed
            created_at: memory.created_at, // Ensure created_at cannot be changed
            glimpse_id: memory.glimpse_id // Ensure glimpse_id cannot be changed
        };

        this.memories.set(id, updatedMemory);
        await this.saveMemories();

        const event: MemoryUpdateEvent = {
            type: 'update',
            memory: updatedMemory,
        };
        this.emit('memoryUpdate', event);

        return updatedMemory;
    }

    /**
     * Delete a memory
     */
    public async deleteMemory(id: string): Promise<void> {
        const memory = this.memories.get(id);
        if (!memory) {
            throw new Error(`Memory with id ${id} not found`);
        }

        this.memories.delete(id);

        // Remove this memory from all linked memories
        for (const [, mem] of this.memories) {
            if (mem.linked_memories.includes(id)) {
                mem.linked_memories = mem.linked_memories.filter(linkId => linkId !== id);
            }
        }

        await this.saveMemories();

        const event: MemoryUpdateEvent = {
            type: 'delete',
            memory,
        };
        this.emit('memoryUpdate', event);
    }

    /**
     * Link two memories together
     */
    public async linkMemories(sourceId: string, targetId: string): Promise<void> {
        const sourceMemory = this.memories.get(sourceId);
        const targetMemory = this.memories.get(targetId);

        if (!sourceMemory || !targetMemory) {
            throw new Error('One or both memories not found');
        }

        if (!sourceMemory.linked_memories.includes(targetId)) {
            sourceMemory.linked_memories.push(targetId);
        }
        if (!targetMemory.linked_memories.includes(sourceId)) {
            targetMemory.linked_memories.push(sourceId);
        }

        await this.saveMemories();

        const event: MemoryUpdateEvent = {
            type: 'link',
            memory: sourceMemory,
            linked_to: [targetId],
        };
        this.emit('memoryUpdate', event);
    }

    /**
     * Search memories based on various parameters
     */
    public async searchMemories(params: MemorySearchParams): Promise<Memory[]> {
        let results = params.memories || Array.from(this.memories.values());

        if (params.query) {
            const query = params.query.toLowerCase();
            results = results.filter(memory =>
                memory.text.toLowerCase().includes(query) ||
                memory.context.focus_area.toLowerCase().includes(query) ||
                (memory.observation && memory.observation.toLowerCase().includes(query))
            );
        }

        if (params.importance_threshold !== undefined) {
            results = results.filter(memory =>
                memory.importance >= params.importance_threshold!
            );
        }

        if (params.emotion_threshold !== undefined) {
            results = results.filter(memory =>
                memory.emotion_score >= params.emotion_threshold!
            );
        }

        if (params.focus_area) {
            results = results.filter(memory =>
                memory.context.focus_area === params.focus_area
            );
        }

        if (params.from_date) {
            results = results.filter(memory =>
                memory.created_at >= params.from_date!
            );
        }

        if (params.to_date) {
            results = results.filter(memory =>
                memory.created_at <= params.to_date!
            );
        }

        results.sort((a, b) => b.importance - a.importance);

        if (params.limit) {
            results = results.slice(0, params.limit);
        }

        return results;
    }

    /**
     * Get a specific memory by ID
     */
    public async getMemory(id: string): Promise<Memory | undefined> {
        const memory = this.memories.get(id);
        if (memory) {
            memory.last_accessed = Date.now();
            await this.saveMemories();
        }
        return memory;
    }

    /**
     * Get all memories
     */
    public async getAllMemories(): Promise<Memory[]> {
        return Array.from(this.memories.values());
    }
}

/**
 * Example usage:
 * 
 * ```typescript
 * // Create a storage provider (e.g., localStorage)
 * const storage = new LocalStorageProvider('agent_123');
 * 
 * // Initialize memory manager
 * const memoryManager = new MemoryManager(storage);
 * 
 * // Create a memory
 * const memory = await memoryManager.createMemory({
 *   text: "User expressed interest in astronomy",
 *   importance: 0.8,
 *   emotion_score: 0.6,
 *   ...
 * });
 * ```
 */