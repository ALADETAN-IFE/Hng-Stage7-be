import type { Request, Response } from "express";
import type { AnalysisResult } from "../src/types";

// Mock OpenRouter SDK before importing anything
jest.mock("@openrouter/sdk", () => {
  return {
    OpenRouter: jest.fn().mockImplementation(() => ({
      chat: {
        send: jest.fn(),
      },
    })),
  };
});

// Mock dependencies
jest.mock("../src/service/database");
jest.mock("../src/service/extract");
jest.mock("../src/service/ai");

// Import after mocking
import { uploadDocument, analyzeDocument, getDocument } from "../src/controller/documentController";
import { dbService } from "../src/service/database";
import { extractText } from "../src/service/extract";
import { analyzeWithLLM } from "../src/service/ai";

describe("Document Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe("uploadDocument", () => {
    it("should return 400 if no file is uploaded", async () => {
      mockRequest = {
        file: undefined,
      };

      await uploadDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "No file uploaded" });
    });

    it("should return 400 if file path is not available", async () => {
      mockRequest = {
        file: {
          fieldname: "file",
          originalname: "test.pdf",
          encoding: "7bit",
          mimetype: "application/pdf",
          size: 1024,
          destination: "uploads/",
          filename: "test.pdf",
          path: undefined,
          buffer: Buffer.from("test"),
        } as unknown as Express.Multer.File,
      };

      await uploadDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "File path not available" });
    });

    it("should successfully upload a document", async () => {
      const mockFile = {
        originalname: "test.pdf",
        path: "uploads/test.pdf",
      } as Express.Multer.File;

      mockRequest = {
        file: mockFile,
      };

      (extractText as jest.Mock).mockResolvedValue("Extracted text content");
      (dbService.create as jest.Mock).mockImplementation(() => {});

      await uploadDocument(mockRequest as Request, mockResponse as Response);

      expect(extractText).toHaveBeenCalledWith("uploads/test.pdf");
      expect(dbService.create).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          message: "File uploaded & text extracted",
        })
      );
    });

    it("should return 422 if text extraction fails", async () => {
      const mockFile = {
        originalname: "test.pdf",
        path: "uploads/test.pdf",
      } as Express.Multer.File;

      mockRequest = {
        file: mockFile,
      };

      (extractText as jest.Mock).mockRejectedValue(new Error("Extraction failed"));

      await uploadDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Failed to extract text from file. Ensure it's a valid PDF, DOCX, or text file.",
      });
    });
  });

  describe("analyzeDocument", () => {
    it("should return 400 if document ID is missing", async () => {
      mockRequest = {
        params: {},
      };

      await analyzeDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "Document ID is required" });
    });

    it("should return 404 if document is not found", async () => {
      mockRequest = {
        params: { id: "non-existent" },
      };

      (dbService.getById as jest.Mock).mockReturnValue(null);

      await analyzeDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "Document not found" });
    });

    it("should successfully analyze a document", async () => {
      const mockDoc = {
        id: "test-123",
        filename: "test.pdf",
        path: "uploads/test.pdf",
        text: "Document text",
        summary: null,
        metadata: null,
        type: null,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const mockAnalysis: AnalysisResult = {
        summary: "Test summary",
        type: "invoice",
        metadata: {
          date: "2024-01-15",
          sender: "Test Sender",
        },
      };

      mockRequest = {
        params: { id: "test-123" },
      };

      (dbService.getById as jest.Mock).mockReturnValue(mockDoc);
      (analyzeWithLLM as jest.Mock).mockResolvedValue(mockAnalysis);
      (dbService.updateAnalysis as jest.Mock).mockImplementation(() => {});

      await analyzeDocument(mockRequest as Request, mockResponse as Response);

      expect(analyzeWithLLM).toHaveBeenCalledWith("Document text");
      expect(dbService.updateAnalysis).toHaveBeenCalledWith(
        "test-123",
        "Test summary",
        mockAnalysis.metadata,
        "invoice"
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Analysis complete",
        ...mockAnalysis,
      });
    });
  });

  describe("getDocument", () => {
    it("should return 400 if document ID is missing", () => {
      mockRequest = {
        params: {},
      };

      getDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "Document ID is required" });
    });

    it("should return 404 if document is not found", () => {
      mockRequest = {
        params: { id: "non-existent" },
      };

      (dbService.getById as jest.Mock).mockReturnValue(null);

      getDocument(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "Document not found" });
    });

    it("should successfully retrieve a document", () => {
      const mockDoc = {
        id: "test-123",
        filename: "test.pdf",
        path: "uploads/test.pdf",
        text: "Document text",
        summary: "Test summary",
        metadata: { date: "2024-01-15" },
        type: "invoice",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      mockRequest = {
        params: { id: "test-123" },
      };

      (dbService.getById as jest.Mock).mockReturnValue(mockDoc);

      getDocument(mockRequest as Request, mockResponse as Response);

      expect(dbService.getById).toHaveBeenCalledWith("test-123");
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockDoc);
    });
  });
});

