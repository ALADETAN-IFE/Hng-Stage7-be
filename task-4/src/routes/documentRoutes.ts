import { Router } from "express";
import {
  uploadDocument,
  analyzeDocument,
  getDocument,
} from "../controller/documentController";
import { upload, uploadErrorHandler } from "../middleware/uploadMiddleware";

const router = Router();

router.post(
  "/upload",
  upload.single("file"),
  uploadErrorHandler,
  uploadDocument
);

router.post("/:id/analyze", analyzeDocument);

router.get("/:id", getDocument);

export default router;
