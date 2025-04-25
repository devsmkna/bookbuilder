import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to save document
  app.post("/api/save-document", async (req, res) => {
    try {
      const { content, title = "Untitled Document" } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Save document to storage
      const document = await storage.saveDocument({ content, title });
      
      return res.status(201).json({
        message: "Document saved successfully",
        document
      });
    } catch (error) {
      console.error("Error saving document:", error);
      return res.status(500).json({ message: "Error saving document" });
    }
  });

  // API route to get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      return res.status(200).json(document);
    } catch (error) {
      console.error("Error retrieving document:", error);
      return res.status(500).json({ message: "Error retrieving document" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
