# MindSculpt: Cognitive Architecture for AI Agents

MindSculpt is a sophisticated cognitive architecture system that enables AI agents to form, manage, and utilize memories while developing distinct personalities over time. It provides a robust framework for creating AI agents with persistent memory, emotional intelligence, and adaptive behavior patterns.

## 🧠 Core Concepts

### Memory Management
MindSculpt implements a unique approach to memory formation and management:
- **Dynamic Memory Formation**: Memories are automatically classified and stored based on importance and emotional impact
- **Contextual Linking**: Memories can be interconnected, forming a neural-like network of experiences
- **Intelligent Filtering**: Advanced filtering system determines which memories are relevant to current contexts
- **Emotional Weighting**: Each memory carries emotional weight and importance scores, influencing agent behavior
- **Time-Aware**: Memories maintain temporal relationships and can be accessed based on chronological relevance

### Classification Service
The heart of MindSculpt's intelligence lies in its ClassificationService:
- **Automated Analysis**: Analyzes interactions in real-time to determine:
  - Importance scores (0-1)
  - Emotional impact (-1 to 1)
  - Focus areas and interaction types
  - Contextual details and scene understanding
- **Memory Linking**: Suggests relevant memory connections based on context
- **Narrative Understanding**: Generates comprehensive observations about interactions
- **Adaptive Learning**: Adjusts classification parameters based on interaction patterns

### Personality Framework
MindSculpt comes with a sophisticated personality system:
- **Configurable Traits**: Core personality traits like empathy, humor, and curiosity
- **Value Systems**: Definable core values that guide agent behavior
- **Communication Patterns**: Customizable communication styles and tones
- **Persistence**: Personalities evolve and persist across sessions

## 🌟 Features

- **Memory Formation & Management**
  - Automatic memory classification
  - Contextual memory linking
  - Importance-based filtering
  - Emotional impact tracking
  - Time-based memory access

- **Personality Management**
  - Trait configuration
  - Value system definition
  - Communication pattern customization
  - Persistent personality development

- **Context Management**
  - Focus area tracking
  - User state monitoring
  - Scene detail preservation
  - Interaction type classification

- **Default Agent: Aria Frost**
  - Pre-configured personality for testing
  - Balanced trait configuration
  - Professional yet warm communication style
  - Example memory network

## 💡 Use Cases

- **AI Companions**: Create agents that remember past interactions and develop relationships
- **Customer Service**: Agents that maintain context and learn from interactions
- **Educational Systems**: Tutors that adapt to student learning patterns
- **Content Creation**: Writers that maintain consistent voice and style
- **Gaming NPCs**: Characters that evolve based on player interactions

## 🛠 Technical Architecture

MindSculpt is built in TypeScript and provides:
- Core memory management system
- Personality framework
- Classification services
- Persistence interfaces
- Event management system

## 🚀 Getting Started

You can install it directly from GitHub:

```bash
# Clone the repository
git clone https://github.com/mindsculpt-ai/mindsculpt.git

# Install dependencies
cd mindsculpt
npm install

# Build the package
npm run build
```

Basic usage:

```typescript
// Basic Memory Management
import { MemoryManager, LocalStorageProvider } from 'mindsculpt-core';

// Initialize with storage provider
const storage = new LocalStorageProvider('my-agent');
const memoryManager = new MemoryManager(storage);

// Create and link memories
const memory1 = await memoryManager.createMemory({
  text: "User discussed their favorite books",
  importance: 0.7,
  emotion_score: 0.5,
  context: {
    focus_area: "interests",
    user_state: "engaged",
    scene_details: "Literary discussion"
  }
});

const memory2 = await memoryManager.createMemory({
  text: "User mentioned they write poetry",
  importance: 0.9,
  emotion_score: 0.8,
  context: {
    focus_area: "hobbies",
    user_state: "passionate",
    scene_details: "Creative discussion"
  }
});

// Link related memories
await memoryManager.linkMemories(memory1.id, memory2.id);

// Search memories
const relevantMemories = await memoryManager.searchMemories({
  importance_threshold: 0.6,
  focus_area: "interests"
});

// Personality Management
import { PersonalityManager } from 'mindsculpt-core';

const personality = await PersonalityManager.createDefault();

// Customize personality
await personality.updateTrait('empathy', 0.9);
await personality.addValue('creativity');
await personality.updateCommunicationStyle({
  style: "supportive",
  tone: "encouraging",
  patterns: ["asks open-ended questions", "provides constructive feedback"]
});

// Classification Example
import { ClassificationService, OpenAIProvider } from 'mindsculpt-core';

const llmProvider = new OpenAIProvider('your-api-key');
const classifier = new ClassificationService(llmProvider);

// Classify an interaction
const classification = await classifier.classifyMemory(
  "I love writing poetry, especially haikus about nature",
  "User shared their creative passion"
);

console.log(classification);
// Output:
// {
//   importance: 0.8,
//   emotion_score: 0.7,
//   focus_area: "creative_expression",
//   observation: "User shows enthusiasm for poetry writing...",
//   suggested_links: ["writing", "nature", "creativity"]
// }

// Complete Agent Setup
const agent = await PersonalityManager.createDefault();
const memory = await agent.createMemory({
  text: "User expressed interest in machine learning",
  importance: 0.9,
  emotion_score: 0.7,
  context: {
    focus_area: "technical_interests",
    user_state: "curious",
    scene_details: "Technical discussion about AI"
  }
});

// Search and use memories for context
const relevantTechnicalMemories = await memoryManager.searchMemories({
  query: "machine learning",
  importance_threshold: 0.7
});
```

## 📁 Directory Structure
```
src/
├── types/
│   └── memory.types.ts         # Core type definitions for memories, personalities, and events
├── services/
│   ├── memoryManager.ts        # Handles memory creation, storage, linking, and retrieval
│   ├── personalityManager.ts   # Manages agent personalities, traits, and behavior patterns
│   ├── classificationService.ts # Analyzes and classifies interactions using LLM
│   └── promptBuilder.ts        # Generates context-aware prompts for LLM interactions
└── config/
    └── llm.config.ts          # LLM provider configuration and interfaces

data/                          # Default configurations and examples
├── memories.json             # Example memory network structure
└── personality.json          # Default Aria Frost personality configuration
```

Each component's purpose:
- `memory.types.ts`: Defines TypeScript interfaces for all core system types
- `memoryManager.ts`: Core memory management system with linking and search capabilities
- `personalityManager.ts`: Personality system with trait management and persistence
- `classificationService.ts`: LLM-powered interaction analysis and classification
- `promptBuilder.ts`: Dynamic prompt generation using memories and personality
- `llm.config.ts`: Abstract LLM provider interface and configuration
- `data/`: Default configurations for testing and development

## 🎯 Why MindSculpt?

Traditional AI systems lack persistent memory and personality evolution. MindSculpt solves this by providing:
- **Memory Management**: Intelligent system for forming and utilizing memories
- **Personality Development**: Framework for creating agents with distinct, evolving personalities
- **Context Awareness**: Sophisticated understanding of interaction context
- **Emotional Intelligence**: Deep understanding of emotional impacts and states

## 🤝 Contributing

MindSculpt is an open-source project and we enthusiastically welcome contributions from the community! Here's how you can contribute:

### Ways to Contribute
- **Code Contributions**: Submit pull requests for bug fixes or new features
- **Documentation**: Help improve our docs or add examples
- **Bug Reports**: Submit detailed bug reports via GitHub Issues
- **Feature Requests**: Share your ideas for new features
- **Use Cases**: Show us how you're using MindSculpt

### Contribution Process
1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/mindsculpt-core.git

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Contribution Guidelines
- Follow the existing code style and TypeScript conventions
- Add tests for new features
- Update documentation as needed
- Keep pull requests focused on a single feature or fix
- Add descriptive commit messages

See our detailed [Contributing Guide](CONTRIBUTING.md) for more information.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

*Note: The React-based demonstration app showcasing MindSculpt's capabilities remains proprietary and is not included in this open-source release.*