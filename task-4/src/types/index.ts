export interface DocumentMetadata {
  date?: string;
  sender?: string;
  total_amount?: string;
  other?: string;
  [key: string]: string | undefined;
}

export interface AnalysisResult {
  summary: string;
  type: "invoice" | "letter" | "cv" | "report" | "unknown";
  metadata: DocumentMetadata;
}

export interface DocumentRow {
  id: string;
  filename: string;
  path: string;
  text: string;
  summary: string | null;
  metadata: string | null;
  type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  path: string;
  text: string;
  summary: string | null;
  metadata: DocumentMetadata | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  id: string;
  filename: string;
  path: string;
  text: string;
  summary?: string | null;
  metadata?: DocumentMetadata | null;
  type?: string;
}

