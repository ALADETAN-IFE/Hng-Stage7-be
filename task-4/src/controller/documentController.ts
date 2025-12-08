import type { Request, Response } from "express";
import { extractTextFromBuffer } from "../service/extract";
import { analyzeWithLLM } from "../service/ai";
import { dbService } from "../service/database";
import { uploadToB2 } from "../service/storage";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ error: "File buffer not available" });
    }

    const file = req.file;

    try {
      // Extract text from buffer
      const text = await extractTextFromBuffer(file.buffer, file.originalname);

      // Generate ID first to use in B2 key
      const id = Date.now().toString();

      // Upload to Backblaze B2 (pass ID to ensure consistency)
      const uploadResult = await uploadToB2(
        file.buffer,
        file.originalname,
        file.mimetype,
        id
      );
      
      // Store B2 key as path (e.g., "documents/1234567890-filename.pdf")
      dbService.create({
        id,
        filename: file.originalname,
        path: uploadResult.key, // Store B2 key instead of local path
        text,
        summary: null,
        metadata: null,
      });

      console.log(`Document uploaded with ID: ${id} and saved to Backblaze B2: ${uploadResult.key}`);

      return res
        .status(201)
        .json({ id, message: "File uploaded & text extracted" });
    } catch (extractError) {
      console.error("Text extraction error:", extractError);
      return res
        .status(422)
        .json({
          error: "Failed to extract text from file. Ensure it's a valid PDF, DOCX, or text file.",
        });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "File upload failed" 
    });
  }
};

export const analyzeDocument = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Document ID is required" });

    const doc = dbService.getById(id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const analysis = await analyzeWithLLM(doc.text);

    dbService.updateAnalysis(id, analysis.summary, analysis.metadata, analysis.type);

    return res.status(200).json({ message: "Analysis complete", ...analysis });
  } catch (error) {
    console.log("Analysis error:", error);
    return res.status(500).json({ error: "Analysis failed" });
  }
};

export const getDocument = (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Document ID is required" });

    const doc = dbService.getById(id);
    if (!doc) {
      console.log(`Document ${id} not found in database`);
      return res.status(404).json({ error: "Document not found" });
    }

    return res.status(200).json(doc);
  } catch (error) {
    console.log("Get document error:", error);
    return res.status(500).json({ error: "Failed to retrieve document" });
  }
};

export const getAllDocuments = (req: Request, res: Response) => {
  try {
    const documents = dbService.getAll();
    return res.status(200).json({ 
      count: documents.length,
      documents 
    });
  } catch (error) {
    console.log("Get all documents error:", error);
    return res.status(500).json({ error: "Failed to retrieve documents" });
  }
};
