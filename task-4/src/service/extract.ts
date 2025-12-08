import fs from "fs";
import { parseDocx } from "docx-parser";

//  * Extract text from a buffer (used for direct uploads)
export async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  try {
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.endsWith(".pdf")) {
      try {
        // pdf-parse exports PDFParse as a class
        const pdfParseModule = require("pdf-parse");
        const PDFParse = pdfParseModule.PDFParse;
        
        if (!PDFParse) {
          throw new Error("PDFParse class not found in pdf-parse module");
        }
        
        // Instantiate the PDFParse class with the buffer as data
        const pdfParser = new PDFParse({ data: buffer });
        // Get text from all pages
        const textResult = await pdfParser.getText();
        return textResult.text;
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        throw new Error(
          `Failed to extract PDF: ${
            pdfError instanceof Error ? pdfError.message : "Unknown error"
          }`
        );
      }
    }

    if (lowerFilename.endsWith(".docx")) {
      try {
        const text = await parseDocx(buffer);
        return text;
      } catch (docxError) {
        console.error("DOCX extraction error:", docxError);
        throw new Error(
          `Failed to extract DOCX: ${
            docxError instanceof Error ? docxError.message : "Unknown error"
          }`
        );
      }
    }

    // For text files or unknown formats
    return buffer.toString();
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
}

//  * Extract text from a file path (kept for backward compatibility if needed)
export async function extractText(path: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(path);
    const filename = path.split("/").pop() || path.split("\\").pop() || "";
    return await extractTextFromBuffer(buffer, filename);
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
}
