import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "documents.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    text TEXT NOT NULL,
    summary TEXT,
    metadata TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const serialize = (obj: any): string | null => {
  return obj ? JSON.stringify(obj) : null;
};

const deserialize = (str: string | null): any => {
  return str ? JSON.parse(str) : null;
};

export const dbService = {
  create: (doc: {
    id: string;
    filename: string;
    path: string;
    text: string;
    summary?: string | null;
    metadata?: any;
    type?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO documents (id, filename, path, text, summary, metadata, type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      doc.id,
      doc.filename,
      doc.path,
      doc.text,
      doc.summary || null,
      serialize(doc.metadata),
      doc.type || null
    );
  },

  getById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM documents WHERE id = ?");
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      filename: row.filename,
      path: row.path,
      text: row.text,
      summary: row.summary,
      metadata: deserialize(row.metadata),
      type: row.type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  updateAnalysis: (id: string, summary: string, metadata: any, type: string) => {
    const stmt = db.prepare(`
      UPDATE documents 
      SET summary = ?, metadata = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(summary, serialize(metadata), type, id);
  },

  getAll: () => {
    const stmt = db.prepare("SELECT * FROM documents ORDER BY created_at DESC");
    const rows = stmt.all() as any[];
    
    return rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      path: row.path,
      text: row.text,
      summary: row.summary,
      metadata: deserialize(row.metadata),
      type: row.type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  close: () => {
    db.close();
  },
};

