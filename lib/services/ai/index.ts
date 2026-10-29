import { AIService } from "./types";
import { MockAIService } from "./mock";
import { LLMAIService } from "./llm";

const mockService = new MockAIService();
const llmService = new LLMAIService();

export function getAIService(): AIService {
  if (process.env.AI_API_KEY) {
    return llmService;
  }
  return mockService;
}

export const aiService = getAIService();
export * from "./types";

