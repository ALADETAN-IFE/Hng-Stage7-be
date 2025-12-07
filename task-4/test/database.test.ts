import Database from "better-sqlite3";
import path from "path";
import { dbService } from "../src/service/database";
import type { CreateDocumentInput, DocumentMetadata } from "../src/types";

describe("Database Service", () => {
  // Clean up test documents after each test
  afterEach(() => {
    // Delete test documents created during tests
    const testIds = [
      "test-123",
      "test-456",
      "test-get-123",
      "test-update-123",
      "test-all-1",
      "test-all-2",
    ];
    
    // Access the database directly for cleanup
    const dbPath = path.join(process.cwd(), "data", "documents.db");
    const db = new Database(dbPath);
    
    testIds.forEach((id) => {
      try {
        const stmt = db.prepare("DELETE FROM documents WHERE id = ?");
        stmt.run(id);
      } catch (error) {
        // Ignore errors if document doesn't exist
      }
    });
    
    db.close();
  });

  describe("create", () => {
    it("should create a new document in the database", () => {
      // Use unique ID to avoid conflicts
      const uniqueId = `test-123-${Date.now()}`;
      const doc: CreateDocumentInput = {
        id: uniqueId,
        filename: "test.pdf",
        path: "uploads/test.pdf",
        text: "Test document content",
        summary: null,
        metadata: null,
      };

      expect(() => dbService.create(doc)).not.toThrow();
      
      const retrieved = dbService.getById(uniqueId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(uniqueId);
      expect(retrieved?.filename).toBe("test.pdf");
      expect(retrieved?.text).toBe("Test document content");
      
      // Clean up
      const dbPath = path.join(process.cwd(), "data", "documents.db");
      const db = new Database(dbPath);
      const stmt = db.prepare("DELETE FROM documents WHERE id = ?");
      stmt.run(uniqueId);
      db.close();
    });

    it("should create a new document in the database - original", () => {
      // Clean up first
      const dbPath = path.join(process.cwd(), "data", "documents.db");
      const db = new Database(dbPath);
      const deleteStmt = db.prepare("DELETE FROM documents WHERE id = ?");
      deleteStmt.run("test-123");
      db.close();
      
      const doc: CreateDocumentInput = {
        id: "test-123",
        filename: "test.pdf",
        path: "uploads/test.pdf",
        text: "Test document content",
        summary: null,
        metadata: null,
      };

      expect(() => dbService.create(doc)).not.toThrow();
      
      const retrieved = dbService.getById("test-123");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe("test-123");
      expect(retrieved?.filename).toBe("test.pdf");
      expect(retrieved?.text).toBe("Test document content");
    });

    it("should handle documents with metadata", () => {
      // Clean up first
      const dbPath = path.join(process.cwd(), "data", "documents.db");
      const db = new Database(dbPath);
      const deleteStmt = db.prepare("DELETE FROM documents WHERE id = ?");
      deleteStmt.run("test-456");
      db.close();
      
      const metadata: DocumentMetadata = {
        date: "2024-01-15",
        sender: "Test Sender",
        total_amount: "$100",
      };

      const doc: CreateDocumentInput = {
        id: "test-456",
        filename: "invoice.pdf",
        path: "uploads/invoice.pdf",
        text: "Invoice content",
        summary: "Test summary",
        metadata,
        type: "invoice",
      };

      expect(() => dbService.create(doc)).not.toThrow();
      
      const retrieved = dbService.getById("test-456");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.metadata).toEqual(metadata);
      expect(retrieved?.type).toBe("invoice");
      expect(retrieved?.summary).toBe("Test summary");
    });
  });

  describe("getById", () => {
    it("should return null for non-existent document", () => {
      const result = dbService.getById("non-existent");
      expect(result).toBeNull();
    });

    it("should retrieve an existing document", () => {
      // Clean up first
      const dbPath = path.join(process.cwd(), "data", "documents.db");
      const db = new Database(dbPath);
      const deleteStmt = db.prepare("DELETE FROM documents WHERE id = ?");
      deleteStmt.run("test-get-123");
      db.close();
      
      const doc: CreateDocumentInput = {
        id: "test-get-123",
        filename: "get-test.pdf",
        path: "uploads/get-test.pdf",
        text: "Get test content",
      };

      dbService.create(doc);
      const retrieved = dbService.getById("test-get-123");
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe("test-get-123");
      expect(retrieved?.filename).toBe("get-test.pdf");
      expect(retrieved?.text).toBe("Get test content");
    });
  });

  describe("updateAnalysis", () => {
    it("should update document analysis results", () => {
      // Clean up first
      const dbPath = path.join(process.cwd(), "data", "documents.db");
      const db = new Database(dbPath);
      const deleteStmt = db.prepare("DELETE FROM documents WHERE id = ?");
      deleteStmt.run("test-update-123");
      db.close();
      
      const doc: CreateDocumentInput = {
        id: "test-update-123",
        filename: "update-test.pdf",
        path: "uploads/update-test.pdf",
        text: "Update test content",
      };

      dbService.create(doc);

      const metadata: DocumentMetadata = {
        date: "2024-01-20",
        sender: "Updated Sender",
      };

      dbService.updateAnalysis(
        "test-update-123",
        "Updated summary",
        metadata,
        "report"
      );

      const updated = dbService.getById("test-update-123");
      expect(updated?.summary).toBe("Updated summary");
      expect(updated?.metadata).toEqual(metadata);
      expect(updated?.type).toBe("report");
    });
  });

  describe("getAll", () => {
    it("should return all documents", () => {
      // Clean up first
      const dbPath = path.join(process.cwd(), "data", "documents.db");
      const db = new Database(dbPath);
      const deleteStmt = db.prepare("DELETE FROM documents WHERE id = ?");
      deleteStmt.run("test-all-1");
      deleteStmt.run("test-all-2");
      db.close();
      
      // Create multiple test documents
      const docs: CreateDocumentInput[] = [
        {
          id: "test-all-1",
          filename: "doc1.pdf",
          path: "uploads/doc1.pdf",
          text: "Content 1",
        },
        {
          id: "test-all-2",
          filename: "doc2.pdf",
          path: "uploads/doc2.pdf",
          text: "Content 2",
        },
      ];

      docs.forEach((doc) => dbService.create(doc));

      const allDocs = dbService.getAll();
      expect(allDocs.length).toBeGreaterThanOrEqual(2);
      
      const ids = allDocs.map((doc) => doc.id);
      expect(ids).toContain("test-all-1");
      expect(ids).toContain("test-all-2");
    });
  });
});

