import type { AnalysisResult } from "../src/types";

// Mock OpenRouter SDK before importing the service
const mockSend = jest.fn();
jest.mock("@openrouter/sdk", () => {
  return {
    OpenRouter: jest.fn().mockImplementation(() => ({
      chat: {
        send: mockSend,
      },
    })),
  };
});

// Import after mocking
import { analyzeWithLLM } from "../src/service/ai";

describe("AI Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeWithLLM", () => {
    it("should successfully analyze text and return structured result", async () => {
      const mockAnalysis: AnalysisResult = {
        summary: "This is a test invoice document.",
        type: "invoice",
        metadata: {
          date: "2024-01-15",
          sender: "Test Company",
          total_amount: "$100.00",
        },
      };

      mockSend.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAnalysis),
            },
          },
        ],
      });

      const result = await analyzeWithLLM("Test document text");

      expect(result).toEqual(mockAnalysis);
      expect(mockSend).toHaveBeenCalled();
    });

    it("should extract JSON from markdown code blocks", async () => {
      const mockAnalysis: AnalysisResult = {
        summary: "Test summary",
        type: "report",
        metadata: {
          date: "2024-01-20",
        },
      };

      const markdownResponse = `\`\`\`json\n${JSON.stringify(mockAnalysis)}\n\`\`\``;

      mockSend.mockResolvedValue({
        choices: [
          {
            message: {
              content: markdownResponse,
            },
          },
        ],
      });

      const result = await analyzeWithLLM("Test text");

      expect(result).toEqual(mockAnalysis);
    });

    it("should handle errors when AI response is invalid", async () => {
      mockSend.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Invalid JSON response",
            },
          },
        ],
      });

      await expect(analyzeWithLLM("Test text")).rejects.toThrow();
    });

    it("should throw error when no message is received", async () => {
      mockSend.mockResolvedValue({
        choices: [],
      });

      await expect(analyzeWithLLM("Test text")).rejects.toThrow("No message received from AI");
    });

    it("should handle non-string message content", async () => {
      const mockAnalysis: AnalysisResult = {
        summary: "Test",
        type: "unknown",
        metadata: {},
      };

      mockSend.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAnalysis,
            },
          },
        ],
      });

      const result = await analyzeWithLLM("Test text");

      // Should stringify and parse the object
      expect(result).toBeDefined();
    });
  });
});

