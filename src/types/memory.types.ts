export interface AgentPersonality {
    agent: {
        id: string;
        name: string;
        description: string;
    };
    traits: {
        empathy: number;
        humor: number;
        curiosity: number;
        [key: string]: number;
    };
    values: string[];
    communication: {
        style: string;
        tone: string;
        patterns: string[];
    };
}

export interface Memory {
    id: string;
    text: string;
    glimpse_id: string;
    observation: string;
    conversation: {
        agent_messages: string[];
        user_messages: string[];
    };
    context: {
        focus_area: string;
        user_state: string;
        scene_details: string;
        interaction_type: string;
        [key: string]: any;
    };
    importance: number;
    emotion_score: number;
    linked_memories: string[];
    created_at: number;
    last_accessed?: number;
    metadata?: Record<string, any>;
}

export interface MemoryGraph {
    nodes: Memory[];
    edges: {
        from: string;
        to: string;
        weight: number;
    }[];
}

export interface MemoryClassification {
    importance: number;
    emotion_score: number;
    focus_area: string;
    interaction_type: string;
    suggested_links: string[];
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: {
        memoryIds?: string[];
        emotionScore?: number;
        importance?: number;
    };
}

export interface PromptTemplate {
    system: string;
    context: string;
    memory_prefix: string;
    memory_suffix: string;
    personality_prefix: string;
    personality_suffix: string;
}

export interface MemorySearchParams {
    query?: string;
    importance_threshold?: number;
    emotion_threshold?: number;
    focus_area?: string;
    limit?: number;
    from_date?: number;
    to_date?: number;
    memories?: Memory[];
    personality?: AgentPersonality;
}

export interface MemoryUpdateEvent {
    type: 'create' | 'update' | 'delete' | 'link';
    memory: Memory;
    linked_to?: string[];
}