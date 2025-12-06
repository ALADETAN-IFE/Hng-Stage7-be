# AI Document Summarization & Metadata Extraction Service

A Node.js/TypeScript service that accepts PDF or DOCX files, extracts text, and uses AI (OpenRouter) to generate summaries, detect document types, and extract metadata.

## Features

- 📄 **Document Upload**: Accept PDF, DOCX, DOC, and TXT files (max 5MB)
- 🔍 **Text Extraction**: Automatically extracts text from uploaded documents
- 🤖 **AI Analysis**: Uses OpenRouter LLM to analyze documents and extract:
  - Concise summary
  - Document type detection (invoice, CV, report, letter, etc.)
  - Metadata extraction (date, sender, total amount, etc.)
- 💾 **Persistent Storage**: SQLite database for fast, reliable data persistence
- 🚀 **Fast Performance**: Optimized with SQLite for sub-millisecond query times

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3) - Fast, file-based database
- **File Upload**: Multer
- **AI Integration**: OpenRouter SDK
- **PDF Parsing**: pdf-parse
- **DOCX Parsing**: docx-parser

## Prerequisites

- Node.js (v20.16.0+ or v22.3.0+)
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-4
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=4000
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

4. Build the project:
```bash
npm run build
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic reloading on file changes.

### Production Mode
```bash
npm run build
npm start
```

The server will start on the port specified in your `.env` file (default: 4000).

## API Endpoints

### 1. Upload Document
**POST** `/documents/upload`

Upload a PDF, DOCX, DOC, or TXT file for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (file upload, max 5MB)

**Response:**
```json
{
  "id": "1765064272974",
  "message": "File uploaded & text extracted"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:4000/documents/upload \
  -F "file=@document.pdf"
```

### 2. Analyze Document
**POST** `/documents/:id/analyze`

Analyze an uploaded document using AI to extract summary, type, and metadata.

**Response:**
```json
{
  "message": "Analysis complete",
  "summary": "This document is an invoice...",
  "type": "invoice",
  "metadata": {
    "date": "2024-01-15",
    "sender": "Company Name",
    "total_amount": "$1,234.56",
    "other": "..."
  }
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:4000/documents/1765064272974/analyze
```

### 3. Get Document
**GET** `/documents/:id`

Retrieve a document with all its data including extracted text, summary, and metadata.

**Response:**
```json
{
  "id": "1765064272974",
  "filename": "document.pdf",
  "path": "uploads/1765064272974-document.pdf",
  "text": "Extracted text content...",
  "summary": "This document is an invoice...",
  "metadata": {
    "date": "2024-01-15",
    "sender": "Company Name",
    "total_amount": "$1,234.56",
    "other": "..."
  },
  "type": "invoice",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

**Example using cURL:**
```bash
curl http://localhost:4000/documents/1765064272974
```

## Project Structure

```
task-4/
├── src/
│   ├── controller/
│   │   └── documentController.ts    # Request handlers
│   ├── middleware/
│   │   └── uploadMiddleware.ts      # File upload configuration
│   ├── routes/
│   │   └── documentRoutes.ts        # API route definitions
│   ├── service/
│   │   ├── ai.ts                    # OpenRouter AI integration
│   │   ├── database.ts              # SQLite database operations
│   │   └── extract.ts               # Text extraction from documents
│   ├── types/
│   │   └── docx-parser.d.ts         # Type definitions
│   └── index.ts                     # Application entry point
├── data/
│   └── documents.db                 # SQLite database (auto-created)
├── uploads/                         # Uploaded files directory
├── .env                             # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | 4000 |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Yes | - |

## Supported File Types

- **PDF** (`.pdf`) - Maximum 5MB
- **DOCX** (`.docx`) - Microsoft Word documents
- **DOC** (`.doc`) - Legacy Microsoft Word documents
- **TXT** (`.txt`) - Plain text files

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created (document uploaded)
- `400` - Bad Request (invalid input)
- `404` - Not Found (document doesn't exist)
- `405` - Method Not Allowed
- `422` - Unprocessable Entity (text extraction failed)
- `500` - Internal Server Error

## Database

The application uses SQLite for persistent storage. The database file is automatically created at `data/documents.db` on first run. The database uses WAL (Write-Ahead Logging) mode for better concurrency performance.

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

### TypeScript Configuration

The project uses TypeScript with strict mode enabled. Configuration is in `tsconfig.json`.

## License

ISC

## Author

IfeCodes

