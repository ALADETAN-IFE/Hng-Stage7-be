import fs from "fs";
import path from "path";
import { extractText } from "../src/service/extract";

describe("Text Extraction Service", () => {
  const testFilesDir = path.join(process.cwd(), "test-files");

  beforeAll(() => {
    // Create test files directory
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testFilesDir)) {
      fs.rmSync(testFilesDir, { recursive: true, force: true });
    }
  });

  describe("extractText", () => {
    it("should extract text from a plain text file", async () => {
      const testContent = "This is a test text file content.";
      const testFilePath = path.join(testFilesDir, "test.txt");
      
      fs.writeFileSync(testFilePath, testContent, "utf-8");

      const extracted = await extractText(testFilePath);
      expect(extracted).toBe(testContent);
    });

    it("should handle empty text files", async () => {
      const testFilePath = path.join(testFilesDir, "empty.txt");
      fs.writeFileSync(testFilePath, "", "utf-8");

      const extracted = await extractText(testFilePath);
      expect(extracted).toBe("");
    });

    it("should handle multi-line text files", async () => {
      const testContent = "Line 1\nLine 2\nLine 3";
      const testFilePath = path.join(testFilesDir, "multiline.txt");
      
      fs.writeFileSync(testFilePath, testContent, "utf-8");

      const extracted = await extractText(testFilePath);
      expect(extracted).toBe(testContent);
    });

    it("should throw an error for non-existent files", async () => {
      const nonExistentPath = path.join(testFilesDir, "non-existent.txt");
      
      await expect(extractText(nonExistentPath)).rejects.toThrow();
    });

    // Note: PDF and DOCX tests would require actual test files
    // These are integration tests that would need sample documents
  });
});

