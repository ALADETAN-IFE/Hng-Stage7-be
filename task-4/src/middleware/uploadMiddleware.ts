import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    const isMimeAllowed = allowedMimes.includes(file.mimetype);
    const isPdfExtension = file.originalname.toLowerCase().endsWith(".pdf"); 
    if (isMimeAllowed || isPdfExtension) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed."));
    }
  },
});

export const uploadErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      console.error("File size limit exceeded:", err);
      return res.status(400).json({ error: "File size exceeds 5MB limit" });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    console.error("Upload middleware error:", err);
    return res.status(400).json({ error: err.message });
  }
  next();
};
