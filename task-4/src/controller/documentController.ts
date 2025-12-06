import type { Request, Response } from "express";
import { extractText } from "../service/extract";
import { analyzeWithLLM } from "../service/ai";

export let documents: any = {};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!req.file.path) {
      return res.status(400).json({ error: "File path not available" });
    }

    const file = req.file;

    try {
      const text = await extractText(file.path);

      const id = Date.now().toString();
      documents[id] = {
        id,
        filename: file.originalname,
        path: file.path,
        text,
        summary: null,
        metadata: null,
      };

      console.log(`Document uploaded with ID: ${id}. Total documents in memory: ${Object.keys(documents).length}`);

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
    return res.status(500).json({ error: "File upload failed" });
  }
};

export const analyzeDocument = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Document ID is required" });

    const doc = documents[id];
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const analysis = await analyzeWithLLM(doc.text);

    doc.summary = analysis.summary;
    doc.metadata = analysis.metadata;
    doc.type = analysis.type;

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

    console.log(`Looking for document ID: ${id}`);
    console.log(`Available document IDs: ${Object.keys(documents).join(", ") || "none"}`);
    
    const doc = documents[id];
    if (!doc) {
      console.log(`Document ${id} not found in memory. Total documents: ${Object.keys(documents).length}`);
      return res.status(404).json({ error: "Document not found" });
    }

    return res.status(200).json(doc);
  } catch (error) {
    console.log("Get document error:", error);
    return res.status(500).json({ error: "Failed to retrieve document" });
  }
};
