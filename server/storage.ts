import { db } from "@db";
import { z } from "zod";

// Very simple in-memory storage for documents
// This would typically be replaced with a database

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Validate document input
const documentSchema = z.object({
  title: z.string().default("Untitled Document"),
  content: z.string().min(1, "Content is required"),
});

type DocumentInput = z.infer<typeof documentSchema>;

class DocumentStorage {
  private documents: Document[] = [];
  private counter = 1;

  async saveDocument(input: DocumentInput): Promise<Document> {
    const validatedData = documentSchema.parse(input);
    
    const now = new Date();
    const newDocument: Document = {
      id: this.counter.toString(),
      title: validatedData.title,
      content: validatedData.content,
      createdAt: now,
      updatedAt: now,
    };
    
    this.counter++;
    this.documents.push(newDocument);
    
    return newDocument;
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    return this.documents.find(doc => doc.id === id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return [...this.documents];
  }
}

export const storage = new DocumentStorage();
