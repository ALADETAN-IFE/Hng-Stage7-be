Task 5:
AI-Powered Document Search & RAG Query Service (Vector DB + OpenRouter)
Problem
Build a backend service that ingests documents, breaks them into chunks, embeds them using an OpenRouter embedding model, stores them in a vector database (Pinecone or ChromaDB), and exposes an endpoint that answers user questions using RAG.
Requirements
 /documents/upload
 Accept PDF, DOCX, or TXT
 Extract clean text
 Chunk the text (e.g., 300–600 tokens)
 Generate embeddings via OpenRouter
 Store chunks + embeddings in Pinecone or ChromaDB
 Record document metadata in DB
 /query
 Embed user question
 Run vector search to fetch top-K relevant chunks
 Build RAG prompt using retrieved context
 Call an OpenRouter LLM to generate an answer
 Return:
 the answer
 list of chunks used
 similarity scores
 /documents
 List uploaded documents and chunk counts
 /documents/:id
 Return extracted text, chunks, and metadata 