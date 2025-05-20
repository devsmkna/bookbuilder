import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import {
  users,
  userStats,
  userAchievements,
  achievementDefinitions,
  writingSessions,
  documents,
  characters,
  races,
  maps,
  events
} from "../shared/schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "./utils";

// Crea un utente temporaneo se non esiste
async function getOrCreateDefaultUser() {
  // Cerca l'utente default
  const defaultUser = await db.select().from(users).where(eq(users.username, "default_user")).limit(1);
  
  // Se l'utente esiste, restituiscilo
  if (defaultUser.length > 0) {
    return defaultUser[0];
  }
  
  // Altrimenti crea un nuovo utente default
  const [newUser] = await db.insert(users)
    .values({
      username: "default_user",
      password: "default_password" // In produzione, usare password sicure e hash
    })
    .returning();
  
  // Crea le statistiche iniziali per l'utente
  await db.insert(userStats)
    .values({
      userId: newUser.id
    });
  
  return newUser;
}

// Middleware per assicurarsi che ci sia un utente corrente
async function ensureUser(req: Request, res: Response, next: NextFunction) {
  try {
    // In un'app reale, questo verrebbe da una sessione autenticata
    // Per ora, usiamo un utente di default
    const user = await getOrCreateDefaultUser();
    (req as any).userId = user.id;
    next();
  } catch (error) {
    console.error("Error ensuring user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Funzione helper per contare le parole in un testo
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware per assicurarsi che ci sia un utente
  app.use(ensureUser);
  
  // API route per salvare un documento
  app.post("/api/documents", async (req, res) => {
    try {
      const { content, title = "Nuovo Documento" } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Il contenuto è obbligatorio" });
      }
      
      // Salva il documento nel database
      const [document] = await db.insert(documents)
        .values({
          userId: (req as any).userId,
          title,
          content,
          wordCount: countWords(content),
          charCount: content.length
        })
        .returning();
      
      return res.status(201).json({
        message: "Documento salvato con successo",
        document
      });
    } catch (error) {
      console.error("Errore nel salvare il documento:", error);
      return res.status(500).json({ message: "Errore nel salvare il documento" });
    }
  });

  // API per ottenere un documento per ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const document = await db.select().from(documents)
        .where(and(
          eq(documents.id, parseInt(id)),
          eq(documents.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!document.length) {
        return res.status(404).json({ message: "Documento non trovato" });
      }
      
      return res.status(200).json(document[0]);
    } catch (error) {
      console.error("Errore nel recuperare il documento:", error);
      return res.status(500).json({ message: "Errore nel recuperare il documento" });
    }
  });
  
  // API per ottenere tutti i documenti dell'utente
  app.get("/api/documents", async (req, res) => {
    try {
      const userDocuments = await db.select().from(documents)
        .where(eq(documents.userId, (req as any).userId))
        .orderBy(desc(documents.lastEdited));
      
      return res.status(200).json(userDocuments);
    } catch (error) {
      console.error("Errore nel recuperare i documenti:", error);
      return res.status(500).json({ message: "Errore nel recuperare i documenti" });
    }
  });
  
  // API per aggiornare un documento
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { content, title } = req.body;
      
      // Verifica che il documento esista e appartenga all'utente
      const existingDocuments = await db.select().from(documents)
        .where(and(
          eq(documents.id, parseInt(id)),
          eq(documents.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!existingDocuments.length) {
        return res.status(404).json({ message: "Documento non trovato" });
      }
      
      const document = existingDocuments[0];
      
      // Aggiorna il documento
      const [updatedDocument] = await db.update(documents)
        .set({
          title: title ?? document.title,
          content: content ?? document.content,
          wordCount: content ? countWords(content) : document.wordCount,
          charCount: content ? content.length : document.charCount,
          lastEdited: new Date()
        })
        .where(eq(documents.id, parseInt(id)))
        .returning();
      
      return res.status(200).json({
        message: "Documento aggiornato con successo",
        document: updatedDocument
      });
    } catch (error) {
      console.error("Errore nell'aggiornare il documento:", error);
      return res.status(500).json({ message: "Errore nell'aggiornare il documento" });
    }
  });
  
  // GAMIFICATION ROUTES
  
  // API per ottenere le statistiche dell'utente
  app.get("/api/stats", async (req, res) => {
    try {
      // Ottieni le statistiche dell'utente
      const stats = await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1);
      
      if (!stats.length) {
        return res.status(404).json({ message: "Statistiche non trovate" });
      }
      
      return res.status(200).json(stats[0]);
    } catch (error) {
      console.error("Errore nel recuperare le statistiche:", error);
      return res.status(500).json({ message: "Errore nel recuperare le statistiche" });
    }
  });
  
  // API per aggiornare le statistiche dell'utente
  app.put("/api/stats", async (req, res) => {
    try {
      const updateSchema = z.object({
        wordCount: z.number().optional(),
        wordCountToday: z.number().optional(),
        wordCountWeek: z.number().optional(),
        characterCount: z.number().optional(),
        placeCount: z.number().optional(),
        eventCount: z.number().optional(),
        raceCount: z.number().optional(),
        sessionsCompleted: z.number().optional(),
        wordsPerDay: z.number().optional(),
        dailyGoalReached: z.boolean().optional(),
        dailyGoalStreak: z.number().optional(),
        writeStreak: z.number().optional(),
        longestWriteStreak: z.number().optional(),
        writeTime: z.number().optional(),
        writingSpeed: z.number().optional(),
        dailyWordGoal: z.number().optional(),
        theme: z.string().optional(),
        experience: z.number().optional(),
        level: z.number().optional()
      });
      
      // Valida i dati di aggiornamento
      const validatedData = updateSchema.parse(req.body);
      
      // Ottieni le statistiche attuali
      const stats = await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1);
      
      if (!stats.length) {
        return res.status(404).json({ message: "Statistiche non trovate" });
      }
      
      // Aggiorna le statistiche
      const [updatedStats] = await db.update(userStats)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(userStats.userId, (req as any).userId))
        .returning();
      
      return res.status(200).json({
        message: "Statistiche aggiornate con successo",
        stats: updatedStats
      });
    } catch (error) {
      console.error("Errore nell'aggiornare le statistiche:", error);
      return res.status(500).json({ message: "Errore nell'aggiornare le statistiche" });
    }
  });
  
  // API per incrementare le statistiche dell'utente
  app.post("/api/stats/increment", async (req, res) => {
    try {
      const incrementSchema = z.object({
        wordCount: z.number().optional(),
        wordCountToday: z.number().optional(),
        wordCountWeek: z.number().optional(),
        characterCount: z.number().optional(),
        placeCount: z.number().optional(),
        eventCount: z.number().optional(),
        raceCount: z.number().optional()
      });
      
      // Valida i dati di incremento
      const validatedData = incrementSchema.parse(req.body);
      
      // Ottieni le statistiche attuali
      const stats = await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1);
      
      if (!stats.length) {
        return res.status(404).json({ message: "Statistiche non trovate" });
      }
      
      const currentStats = stats[0];
      
      // Crea l'oggetto con i valori aggiornati
      const updates: Record<string, number> = {};
      
      if (validatedData.wordCount) {
        updates.wordCount = currentStats.wordCount + validatedData.wordCount;
      }
      
      if (validatedData.wordCountToday) {
        updates.wordCountToday = currentStats.wordCountToday + validatedData.wordCountToday;
      }
      
      if (validatedData.wordCountWeek) {
        updates.wordCountWeek = currentStats.wordCountWeek + validatedData.wordCountWeek;
      }
      
      if (validatedData.characterCount) {
        updates.characterCount = currentStats.characterCount + validatedData.characterCount;
      }
      
      if (validatedData.placeCount) {
        updates.placeCount = currentStats.placeCount + validatedData.placeCount;
      }
      
      if (validatedData.eventCount) {
        updates.eventCount = currentStats.eventCount + validatedData.eventCount;
      }
      
      if (validatedData.raceCount) {
        updates.raceCount = currentStats.raceCount + validatedData.raceCount;
      }
      
      // Verifica se l'obiettivo giornaliero è stato raggiunto
      if (
        validatedData.wordCountToday && 
        !currentStats.dailyGoalReached && 
        currentStats.wordCountToday + validatedData.wordCountToday >= currentStats.dailyWordGoal
      ) {
        updates.dailyGoalReached = 1; // Usiamo 1 invece di true per rispettare il tipo numerico nel DB
        updates.dailyGoalStreak = currentStats.dailyGoalStreak + 1;
      }
      
      // Aggiorna le statistiche
      const [updatedStats] = await db.update(userStats)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(userStats.userId, (req as any).userId))
        .returning();
      
      // Avvia il processo di verifica degli achievement
      await checkAndUpdateAchievements(updatedStats);
      
      return res.status(200).json({
        message: "Statistiche incrementate con successo",
        stats: updatedStats
      });
    } catch (error) {
      console.error("Errore nell'incrementare le statistiche:", error);
      return res.status(500).json({ message: "Errore nell'incrementare le statistiche" });
    }
  });
  
  // API per ottenere gli achievement dell'utente
  app.get("/api/achievements", async (req, res) => {
    try {
      // Ottieni tutti gli achievement
      const allAchievements = await db.select().from(achievementDefinitions);
      
      // Ottieni gli achievement sbloccati dall'utente
      const userUnlockedAchievements = await db.select().from(userAchievements)
        .where(and(
          eq(userAchievements.userId, (req as any).userId),
          eq(userAchievements.unlocked, true)
        ));
      
      // Ottieni gli achievement in corso
      const userInProgressAchievements = await db.select().from(userAchievements)
        .where(and(
          eq(userAchievements.userId, (req as any).userId),
          eq(userAchievements.unlocked, false)
        ));
      
      // Crea una mappa degli achievement dell'utente per facile accesso
      const userAchievementsMap: Record<string, { unlocked: boolean, progress: number, unlockDate?: Date }> = {};
      
      // Aggiungi gli achievement sbloccati alla mappa
      userUnlockedAchievements.forEach(achievement => {
        userAchievementsMap[achievement.achievementId] = {
          unlocked: true,
          progress: 100,
          unlockDate: achievement.unlockDate ?? undefined
        };
      });
      
      // Aggiungi gli achievement in corso alla mappa
      userInProgressAchievements.forEach(achievement => {
        userAchievementsMap[achievement.achievementId] = {
          unlocked: false,
          progress: achievement.progress
        };
      });
      
      // Combina gli achievement con lo stato dell'utente
      const enhancedAchievements = allAchievements.map(achievement => {
        const userAchievement = userAchievementsMap[achievement.id] || {
          unlocked: false,
          progress: 0
        };
        
        return {
          ...achievement,
          ...userAchievement
        };
      });
      
      return res.status(200).json(enhancedAchievements);
    } catch (error) {
      console.error("Errore nel recuperare gli achievement:", error);
      return res.status(500).json({ message: "Errore nel recuperare gli achievement" });
    }
  });
  
  // API per aggiornare lo stato di un achievement
  app.put("/api/achievements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { unlocked, progress } = req.body;
      
      // Verifica che l'achievement esista
      const achievements = await db.select().from(achievementDefinitions)
        .where(eq(achievementDefinitions.id, id))
        .limit(1);
      
      if (!achievements.length) {
        return res.status(404).json({ message: "Achievement non trovato" });
      }
      
      const achievement = achievements[0];
      
      // Verifica se l'utente ha già questo achievement
      const userAchievementsResult = await db.select().from(userAchievements)
        .where(and(
          eq(userAchievements.userId, (req as any).userId),
          eq(userAchievements.achievementId, id)
        ))
        .limit(1);
      
      let result;
      
      if (userAchievementsResult && Array.isArray(userAchievementsResult) && userAchievementsResult.length > 0) {
        const userAchievement = userAchievementsResult[0];
        
        // Aggiorna l'achievement esistente
        [result] = await db.update(userAchievements)
          .set({
            unlocked: unlocked !== undefined ? unlocked : userAchievement.unlocked,
            progress: progress !== undefined ? progress : userAchievement.progress,
            unlockDate: unlocked && !userAchievement.unlocked ? new Date() : userAchievement.unlockDate
          })
          .where(and(
            eq(userAchievements.userId, (req as any).userId),
            eq(userAchievements.achievementId, id)
          ))
          .returning();
      } else {
        // Crea un nuovo record per l'achievement
        [result] = await db.insert(userAchievements)
          .values({
            userId: (req as any).userId,
            achievementId: id,
            unlocked: unlocked || false,
            progress: progress || 0,
            unlockDate: unlocked ? new Date() : null
          })
          .returning();
      }
      
      // Se l'achievement è stato sbloccato, aggiorna l'esperienza dell'utente
      if (unlocked && (!userAchievements.length || !userAchievements[0].unlocked)) {
        const stats = await db.select().from(userStats)
          .where(eq(userStats.userId, (req as any).userId))
          .limit(1);
        
        if (stats.length > 0) {
          await db.update(userStats)
            .set({
              experience: stats[0].experience + achievement.xp
            })
            .where(eq(userStats.userId, (req as any).userId));
        }
      }
      
      return res.status(200).json({
        message: "Achievement aggiornato con successo",
        achievement: { ...achievement, ...result }
      });
    } catch (error) {
      console.error("Errore nell'aggiornare l'achievement:", error);
      return res.status(500).json({ message: "Errore nell'aggiornare l'achievement" });
    }
  });
  
  // API per creare una nuova sessione di scrittura
  app.post("/api/writing-sessions", async (req, res) => {
    try {
      const sessionSchema = z.object({
        wordCount: z.number().min(0),
        duration: z.number().min(0),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
        date: z.string().datetime().optional()
      });
      
      // Valida i dati della sessione
      const validatedData = sessionSchema.parse(req.body);
      
      // Prepara i dati per la nuova sessione di scrittura
      const sessionData = {
        userId: (req as any).userId,
        wordCount: validatedData.wordCount || 0,
        duration: validatedData.duration || 0,
        startTime: validatedData.startTime ? new Date(validatedData.startTime).toISOString() : new Date().toISOString(),
        endTime: validatedData.endTime ? new Date(validatedData.endTime).toISOString() : null,
        date: validatedData.date || new Date().toISOString().split('T')[0]
      };
      
      // Crea una nuova sessione di scrittura
      const [session] = await db.insert(writingSessions)
        .values(sessionData)
        .returning();
      
      // Ottieni le statistiche attuali
      const stats = await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1);
      
      if (stats.length > 0) {
        const currentStats = stats[0];
        
        // Aggiorna le statistiche
        await db.update(userStats)
          .set({
            wordCount: currentStats.wordCount + validatedData.wordCount,
            wordCountToday: currentStats.wordCountToday + validatedData.wordCount,
            wordCountWeek: currentStats.wordCountWeek + validatedData.wordCount,
            sessionsCompleted: currentStats.sessionsCompleted + 1,
            writeTime: currentStats.writeTime + validatedData.duration
          })
          .where(eq(userStats.userId, (req as any).userId));
      }
      
      return res.status(201).json({
        message: "Sessione di scrittura registrata con successo",
        session
      });
    } catch (error) {
      console.error("Errore nella creazione della sessione di scrittura:", error);
      return res.status(500).json({ message: "Errore nella creazione della sessione di scrittura" });
    }
  });
  
  // API per ottenere le sessioni di scrittura dell'utente
  app.get("/api/writing-sessions", ensureUser, async (req, res) => {
    try {
      // Parametri di filtro per data
      const { startDate, endDate } = req.query;
      
      // Costruisci le condizioni base
      let conditions = [eq(writingSessions.userId, (req as any).userId)];
      
      // Aggiungi condizioni per le date se presenti
      if (startDate) {
        const formattedStartDate = new Date(startDate as string).toISOString().split('T')[0];
        conditions.push(gte(writingSessions.date, formattedStartDate));
      }
      
      if (endDate) {
        const formattedEndDate = new Date(endDate as string).toISOString().split('T')[0];
        conditions.push(lte(writingSessions.date, formattedEndDate));
      }
      
      // Esegui la query con tutte le condizioni
      const sessions = await db.select()
        .from(writingSessions)
        .where(and(...conditions))
        .orderBy(desc(writingSessions.date));
      
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Errore nel recuperare le sessioni di scrittura:", error);
      return res.status(500).json({ message: "Errore nel recuperare le sessioni di scrittura" });
    }
  });
  
  // CHARACTERS API
  // API per ottenere tutti i personaggi dell'utente
  app.get("/api/characters", async (req, res) => {
    try {
      const userCharacters = await db.select().from(characters)
        .where(eq(characters.userId, (req as any).userId))
        .orderBy(asc(characters.name));
      
      return res.status(200).json(userCharacters);
    } catch (error) {
      console.error("Errore nel recuperare i personaggi:", error);
      return res.status(500).json({ message: "Errore nel recuperare i personaggi" });
    }
  });
  
  // API per ottenere un personaggio specifico
  app.get("/api/characters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const character = await db.select().from(characters)
        .where(and(
          eq(characters.id, id),
          eq(characters.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!character.length) {
        return res.status(404).json({ message: "Personaggio non trovato" });
      }
      
      return res.status(200).json(character[0]);
    } catch (error) {
      console.error("Errore nel recuperare il personaggio:", error);
      return res.status(500).json({ message: "Errore nel recuperare il personaggio" });
    }
  });
  
  // API per creare un nuovo personaggio
  app.post("/api/characters", async (req, res) => {
    try {
      const characterSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        pronunciation: z.string().optional(),
        aliases: z.string().optional(),
        age: z.string().optional(),
        race: z.string().optional(),
        imageData: z.string().optional(),
        
        // Tratti fisici
        eyeColor: z.string().optional(),
        secondEyeColor: z.string().optional(),
        hasHeterochromia: z.boolean().optional(),
        hairColor: z.string().optional(),
        skinColor: z.string().optional(),
        height: z.string().optional(),
        bodyType: z.string().optional(),
        
        // Comportamento
        attitude: z.string().optional(),
        bodyLanguage: z.string().optional(), 
        bodySigns: z.string().optional(),
        
        // Personale
        parentalRelationship: z.string().optional(),
        parentalTeachings: z.string().optional(),
        respect: z.string().optional(),
        hates: z.string().optional(),
        fears: z.string().optional(),
        contradictions: z.string().optional(),
        dreams: z.string().optional(),
        sacrificeForDreams: z.string().optional(),
        values: z.string().optional(),
        antiValues: z.string().optional(),
        
        // Evoluzione
        motivationEvolution: z.string().optional(),
        emotionalEvolution: z.string().optional(),
        relationshipEvolution: z.string().optional(),
        dreamEvolution: z.string().optional()
      });
      
      // Valida i dati
      const validatedData = characterSchema.parse(req.body);
      
      // Calcola la percentuale di completamento
      const totalFields = 30; // Numero di campi che contribuiscono al completamento
      const filledFields = Object.entries(validatedData).filter(([_, value]) => 
        value !== undefined && value !== "" && value !== null
      ).length;
      const completionPercentage = Math.round((filledFields / totalFields) * 100);
      
      // Crea un nuovo personaggio
      const [character] = await db.insert(characters)
        .values({
          id: generateId('char'),
          userId: (req as any).userId,
          ...validatedData,
          completionPercentage
        })
        .returning();
      
      // Incrementa il contatore dei personaggi nelle statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0) {
            await db.update(userStats)
              .set({
                characterCount: stats[0].characterCount + 1
              })
              .where(eq(userStats.userId, (req as any).userId));
            
            // Verifica e aggiorna gli achievement
            await checkAndUpdateAchievements({
              ...stats[0],
              characterCount: stats[0].characterCount + 1
            });
          }
        });
      
      return res.status(201).json({
        message: "Personaggio creato con successo",
        character
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati del personaggio non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nella creazione del personaggio:", error);
      return res.status(500).json({ message: "Errore nella creazione del personaggio" });
    }
  });
  
  // API per aggiornare un personaggio esistente
  app.put("/api/characters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che il personaggio esista e appartenga all'utente
      const character = await db.select().from(characters)
        .where(and(
          eq(characters.id, id),
          eq(characters.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!character.length) {
        return res.status(404).json({ message: "Personaggio non trovato" });
      }
      
      const characterSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        pronunciation: z.string().optional().nullable(),
        aliases: z.string().optional().nullable(),
        age: z.string().optional().nullable(),
        race: z.string().optional().nullable(),
        imageData: z.string().optional().nullable(),
        
        // Tratti fisici
        eyeColor: z.string().optional().nullable(),
        secondEyeColor: z.string().optional().nullable(),
        hasHeterochromia: z.boolean().optional(),
        hairColor: z.string().optional().nullable(),
        skinColor: z.string().optional().nullable(),
        height: z.string().optional().nullable(),
        bodyType: z.string().optional().nullable(),
        
        // Comportamento
        attitude: z.string().optional().nullable(),
        bodyLanguage: z.string().optional().nullable(),
        bodySigns: z.string().optional().nullable(),
        
        // Personale
        parentalRelationship: z.string().optional().nullable(),
        parentalTeachings: z.string().optional().nullable(),
        respect: z.string().optional().nullable(),
        hates: z.string().optional().nullable(),
        fears: z.string().optional().nullable(),
        contradictions: z.string().optional().nullable(),
        dreams: z.string().optional().nullable(),
        sacrificeForDreams: z.string().optional().nullable(),
        values: z.string().optional().nullable(),
        antiValues: z.string().optional().nullable(),
        
        // Evoluzione
        motivationEvolution: z.string().optional().nullable(),
        emotionalEvolution: z.string().optional().nullable(),
        relationshipEvolution: z.string().optional().nullable(),
        dreamEvolution: z.string().optional().nullable()
      });
      
      // Valida i dati
      const validatedData = characterSchema.parse(req.body);
      
      // Calcola la percentuale di completamento
      const totalFields = 30; // Numero di campi che contribuiscono al completamento
      const filledFields = Object.entries(validatedData).filter(([_, value]) => 
        value !== undefined && value !== "" && value !== null
      ).length;
      const completionPercentage = Math.round((filledFields / totalFields) * 100);
      
      // Aggiorna il personaggio
      const [updatedCharacter] = await db.update(characters)
        .set({
          ...validatedData,
          completionPercentage,
          updatedAt: new Date()
        })
        .where(eq(characters.id, id))
        .returning();
      
      return res.status(200).json({
        message: "Personaggio aggiornato con successo",
        character: updatedCharacter
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati del personaggio non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nell'aggiornamento del personaggio:", error);
      return res.status(500).json({ message: "Errore nell'aggiornamento del personaggio" });
    }
  });
  
  // API per eliminare un personaggio
  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che il personaggio esista e appartenga all'utente
      const character = await db.select().from(characters)
        .where(and(
          eq(characters.id, id),
          eq(characters.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!character.length) {
        return res.status(404).json({ message: "Personaggio non trovato" });
      }
      
      // Elimina il personaggio
      await db.delete(characters)
        .where(eq(characters.id, id));
      
      // Aggiorna le statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0 && stats[0].characterCount > 0) {
            await db.update(userStats)
              .set({
                characterCount: stats[0].characterCount - 1
              })
              .where(eq(userStats.userId, (req as any).userId));
          }
        });
      
      return res.status(200).json({
        message: "Personaggio eliminato con successo"
      });
    } catch (error) {
      console.error("Errore nell'eliminazione del personaggio:", error);
      return res.status(500).json({ message: "Errore nell'eliminazione del personaggio" });
    }
  });

  // API RACES
  // API per ottenere tutte le razze dell'utente
  app.get("/api/races", async (req, res) => {
    try {
      const userRaces = await db.select().from(races)
        .where(eq(races.userId, (req as any).userId))
        .orderBy(asc(races.name));
      
      return res.status(200).json(userRaces);
    } catch (error) {
      console.error("Errore nel recuperare le razze:", error);
      return res.status(500).json({ message: "Errore nel recuperare le razze" });
    }
  });
  
  // API per ottenere una razza specifica
  app.get("/api/races/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const race = await db.select().from(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!race.length) {
        return res.status(404).json({ message: "Razza non trovata" });
      }
      
      return res.status(200).json(race[0]);
    } catch (error) {
      console.error("Errore nel recuperare la razza:", error);
      return res.status(500).json({ message: "Errore nel recuperare la razza" });
    }
  });
  
  // API per creare una nuova razza
  app.post("/api/races", async (req, res) => {
    try {
      const raceSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        lore: z.string().optional(),
        traits: z.string().optional(),
        society: z.string().optional(),
        habitat: z.string().optional(),
        imageData: z.string().optional()
      });
      
      // Valida i dati
      const validatedData = raceSchema.parse(req.body);
      
      // Crea una nuova razza
      const [race] = await db.insert(races)
        .values({
          id: generateId('race'),
          userId: (req as any).userId,
          ...validatedData
        })
        .returning();
      
      // Incrementa il contatore delle razze nelle statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0) {
            await db.update(userStats)
              .set({
                raceCount: stats[0].raceCount + 1
              })
              .where(eq(userStats.userId, (req as any).userId));
            
            // Verifica e aggiorna gli achievement
            await checkAndUpdateAchievements({
              ...stats[0],
              raceCount: stats[0].raceCount + 1
            });
          }
        });
      
      return res.status(201).json({
        message: "Razza creata con successo",
        race
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della razza non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nella creazione della razza:", error);
      return res.status(500).json({ message: "Errore nella creazione della razza" });
    }
  });
  
  // API per aggiornare una razza esistente
  app.put("/api/races/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la razza esista e appartenga all'utente
      const race = await db.select().from(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!race.length) {
        return res.status(404).json({ message: "Razza non trovata" });
      }
      
      const raceSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        lore: z.string().optional().nullable(),
        traits: z.string().optional().nullable(),
        society: z.string().optional().nullable(),
        habitat: z.string().optional().nullable(),
        imageData: z.string().optional().nullable()
      });
      
      // Valida i dati
      const validatedData = raceSchema.parse(req.body);
      
      // Aggiorna la razza
      const [updatedRace] = await db.update(races)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(races.id, id))
        .returning();
      
      return res.status(200).json({
        message: "Razza aggiornata con successo",
        race: updatedRace
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della razza non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nell'aggiornamento della razza:", error);
      return res.status(500).json({ message: "Errore nell'aggiornamento della razza" });
    }
  });
  
  // API per eliminare una razza
  app.delete("/api/races/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la razza esista e appartenga all'utente
      const race = await db.select().from(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!race.length) {
        return res.status(404).json({ message: "Razza non trovata" });
      }
      
      // Elimina la razza
      await db.delete(races)
        .where(eq(races.id, id));
      
      // Aggiorna le statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0 && stats[0].raceCount > 0) {
            await db.update(userStats)
              .set({
                raceCount: stats[0].raceCount - 1
              })
              .where(eq(userStats.userId, (req as any).userId));
          }
        });
      
      return res.status(200).json({
        message: "Razza eliminata con successo"
      });
    } catch (error) {
      console.error("Errore nell'eliminazione della razza:", error);
      return res.status(500).json({ message: "Errore nell'eliminazione della razza" });
    }
  });
  
  // API MAPS
  // API per ottenere tutte le mappe dell'utente
  app.get("/api/maps", async (req, res) => {
    try {
      const userMaps = await db.select().from(maps)
        .where(eq(maps.userId, (req as any).userId))
        .orderBy(asc(maps.name));
      
      return res.status(200).json(userMaps);
    } catch (error) {
      console.error("Errore nel recuperare le mappe:", error);
      return res.status(500).json({ message: "Errore nel recuperare le mappe" });
    }
  });
  
  // API per ottenere una mappa specifica
  app.get("/api/maps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const map = await db.select().from(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!map.length) {
        return res.status(404).json({ message: "Mappa non trovata" });
      }
      
      return res.status(200).json(map[0]);
    } catch (error) {
      console.error("Errore nel recuperare la mappa:", error);
      return res.status(500).json({ message: "Errore nel recuperare la mappa" });
    }
  });
  
  // API per creare una nuova mappa
  app.post("/api/maps", async (req, res) => {
    try {
      const mapSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        description: z.string().optional(),
        imageData: z.string().min(1, "L'immagine è obbligatoria"),
        points: z.array(z.any()).optional()
      });
      
      // Valida i dati
      const validatedData = mapSchema.parse(req.body);
      
      // Converti i punti in formato JSON se presenti
      const points = validatedData.points ? JSON.stringify(validatedData.points) : '[]';
      
      // Crea una nuova mappa
      const [map] = await db.insert(maps)
        .values({
          id: generateId('map'),
          userId: (req as any).userId,
          name: validatedData.name,
          description: validatedData.description,
          imageData: validatedData.imageData,
          points
        })
        .returning();
      
      // Incrementa il contatore dei luoghi nelle statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0) {
            await db.update(userStats)
              .set({
                placeCount: stats[0].placeCount + 1
              })
              .where(eq(userStats.userId, (req as any).userId));
            
            // Verifica e aggiorna gli achievement
            await checkAndUpdateAchievements({
              ...stats[0],
              placeCount: stats[0].placeCount + 1
            });
          }
        });
      
      return res.status(201).json({
        message: "Mappa creata con successo",
        map
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della mappa non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nella creazione della mappa:", error);
      return res.status(500).json({ message: "Errore nella creazione della mappa" });
    }
  });
  
  // API per aggiornare una mappa esistente
  app.put("/api/maps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la mappa esista e appartenga all'utente
      const map = await db.select().from(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!map.length) {
        return res.status(404).json({ message: "Mappa non trovata" });
      }
      
      const mapSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        description: z.string().optional().nullable(),
        imageData: z.string().min(1, "L'immagine è obbligatoria"),
        points: z.array(z.any()).optional()
      });
      
      // Valida i dati
      const validatedData = mapSchema.parse(req.body);
      
      // Converti i punti in formato JSON se presenti
      const points = validatedData.points ? JSON.stringify(validatedData.points) : '[]';
      
      // Aggiorna la mappa
      const [updatedMap] = await db.update(maps)
        .set({
          name: validatedData.name,
          description: validatedData.description,
          imageData: validatedData.imageData,
          points,
          updatedAt: new Date()
        })
        .where(eq(maps.id, id))
        .returning();
      
      return res.status(200).json({
        message: "Mappa aggiornata con successo",
        map: updatedMap
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della mappa non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nell'aggiornamento della mappa:", error);
      return res.status(500).json({ message: "Errore nell'aggiornamento della mappa" });
    }
  });
  
  // API per eliminare una mappa
  app.delete("/api/maps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la mappa esista e appartenga all'utente
      const map = await db.select().from(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!map.length) {
        return res.status(404).json({ message: "Mappa non trovata" });
      }
      
      // Elimina la mappa
      await db.delete(maps)
        .where(eq(maps.id, id));
      
      // Aggiorna le statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0 && stats[0].placeCount > 0) {
            await db.update(userStats)
              .set({
                placeCount: stats[0].placeCount - 1
              })
              .where(eq(userStats.userId, (req as any).userId));
          }
        });
      
      return res.status(200).json({
        message: "Mappa eliminata con successo"
      });
    } catch (error) {
      console.error("Errore nell'eliminazione della mappa:", error);
      return res.status(500).json({ message: "Errore nell'eliminazione della mappa" });
    }
  });
  
  // API EVENTS
  // API per ottenere tutti gli eventi dell'utente
  app.get("/api/events", async (req, res) => {
    try {
      const userEvents = await db.select().from(events)
        .where(eq(events.userId, (req as any).userId))
        .orderBy(desc(events.importance));
      
      return res.status(200).json(userEvents);
    } catch (error) {
      console.error("Errore nel recuperare gli eventi:", error);
      return res.status(500).json({ message: "Errore nel recuperare gli eventi" });
    }
  });
  
  // API per ottenere un evento specifico
  app.get("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const event = await db.select().from(events)
        .where(and(
          eq(events.id, id),
          eq(events.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!event.length) {
        return res.status(404).json({ message: "Evento non trovato" });
      }
      
      return res.status(200).json(event[0]);
    } catch (error) {
      console.error("Errore nel recuperare l'evento:", error);
      return res.status(500).json({ message: "Errore nel recuperare l'evento" });
    }
  });
  
  // API per creare un nuovo evento
  app.post("/api/events", async (req, res) => {
    try {
      const eventSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        description: z.string().optional(),
        date: z.string().optional(),
        importance: z.number().min(0).max(10).default(0),
        involvedCharacters: z.array(z.string()).optional(),
        locations: z.array(z.string()).optional()
      });
      
      // Valida i dati
      const validatedData = eventSchema.parse(req.body);
      
      // Converti gli array in formato JSON
      const involvedCharacters = validatedData.involvedCharacters 
        ? JSON.stringify(validatedData.involvedCharacters) 
        : '[]';
      
      const locations = validatedData.locations 
        ? JSON.stringify(validatedData.locations) 
        : '[]';
      
      // Crea un nuovo evento
      const [event] = await db.insert(events)
        .values({
          id: generateId('event'),
          userId: (req as any).userId,
          name: validatedData.name,
          description: validatedData.description,
          date: validatedData.date,
          importance: validatedData.importance,
          involvedCharacters,
          locations
        })
        .returning();
      
      // Incrementa il contatore degli eventi nelle statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0) {
            await db.update(userStats)
              .set({
                eventCount: stats[0].eventCount + 1
              })
              .where(eq(userStats.userId, (req as any).userId));
            
            // Verifica e aggiorna gli achievement
            await checkAndUpdateAchievements({
              ...stats[0],
              eventCount: stats[0].eventCount + 1
            });
          }
        });
      
      return res.status(201).json({
        message: "Evento creato con successo",
        event
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati dell'evento non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nella creazione dell'evento:", error);
      return res.status(500).json({ message: "Errore nella creazione dell'evento" });
    }
  });
  
  // API per aggiornare un evento esistente
  app.put("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che l'evento esista e appartenga all'utente
      const event = await db.select().from(events)
        .where(and(
          eq(events.id, id),
          eq(events.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!event.length) {
        return res.status(404).json({ message: "Evento non trovato" });
      }
      
      const eventSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        description: z.string().optional().nullable(),
        date: z.string().optional().nullable(),
        importance: z.number().min(0).max(10).default(0),
        involvedCharacters: z.array(z.string()).optional(),
        locations: z.array(z.string()).optional()
      });
      
      // Valida i dati
      const validatedData = eventSchema.parse(req.body);
      
      // Converti gli array in formato JSON
      const involvedCharacters = validatedData.involvedCharacters 
        ? JSON.stringify(validatedData.involvedCharacters) 
        : '[]';
      
      const locations = validatedData.locations 
        ? JSON.stringify(validatedData.locations) 
        : '[]';
      
      // Aggiorna l'evento
      const [updatedEvent] = await db.update(events)
        .set({
          name: validatedData.name,
          description: validatedData.description,
          date: validatedData.date,
          importance: validatedData.importance,
          involvedCharacters,
          locations,
          updatedAt: new Date()
        })
        .where(eq(events.id, id))
        .returning();
      
      return res.status(200).json({
        message: "Evento aggiornato con successo",
        event: updatedEvent
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati dell'evento non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nell'aggiornamento dell'evento:", error);
      return res.status(500).json({ message: "Errore nell'aggiornamento dell'evento" });
    }
  });
  
  // API per eliminare un evento
  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che l'evento esista e appartenga all'utente
      const event = await db.select().from(events)
        .where(and(
          eq(events.id, id),
          eq(events.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!event.length) {
        return res.status(404).json({ message: "Evento non trovato" });
      }
      
      // Elimina l'evento
      await db.delete(events)
        .where(eq(events.id, id));
      
      // Aggiorna le statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0 && stats[0].eventCount > 0) {
            await db.update(userStats)
              .set({
                eventCount: stats[0].eventCount - 1
              })
              .where(eq(userStats.userId, (req as any).userId));
          }
        });
      
      return res.status(200).json({
        message: "Evento eliminato con successo"
      });
    } catch (error) {
      console.error("Errore nell'eliminazione dell'evento:", error);
      return res.status(500).json({ message: "Errore nell'eliminazione dell'evento" });
    }
  });

  // API per le razze (Races)
  // ----------------------------------------------------
  
  // GET tutte le razze
  app.get("/api/races", async (req, res) => {
    try {
      const userRaces = await db.select().from(races)
        .where(eq(races.userId, (req as any).userId))
        .orderBy(asc(races.name));
      
      return res.status(200).json(userRaces);
    } catch (error) {
      console.error("Errore nel recuperare le razze:", error);
      return res.status(500).json({ message: "Errore nel recuperare le razze" });
    }
  });
  
  // GET razza per ID
  app.get("/api/races/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const race = await db.select().from(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!race.length) {
        return res.status(404).json({ message: "Razza non trovata" });
      }
      
      return res.status(200).json(race[0]);
    } catch (error) {
      console.error("Errore nel recuperare la razza:", error);
      return res.status(500).json({ message: "Errore nel recuperare la razza" });
    }
  });
  
  // POST nuova razza
  app.post("/api/races", async (req, res) => {
    try {
      const raceSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        lore: z.string().optional().nullable(),
        traits: z.string().optional().nullable(),
        society: z.string().optional().nullable(),
        habitat: z.string().optional().nullable(),
        imageData: z.string().optional().nullable()
      });
      
      // Valida i dati
      const validatedData = raceSchema.parse(req.body);
      
      // Crea una nuova razza
      const [race] = await db.insert(races)
        .values({
          id: generateId('race'),
          userId: (req as any).userId,
          ...validatedData
        })
        .returning();
      
      // Incrementa il contatore delle razze nelle statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0) {
            await db.update(userStats)
              .set({
                raceCount: stats[0].raceCount + 1
              })
              .where(eq(userStats.userId, (req as any).userId));
            
            // Verifica e aggiorna gli achievement
            await checkAndUpdateAchievements({
              ...stats[0],
              raceCount: stats[0].raceCount + 1
            });
          }
        });
      
      return res.status(201).json({
        message: "Razza creata con successo",
        race
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della razza non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nella creazione della razza:", error);
      return res.status(500).json({ message: "Errore nella creazione della razza" });
    }
  });
  
  // PUT aggiorna razza per ID
  app.put("/api/races/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la razza esista e appartenga all'utente
      const existingRace = await db.select().from(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!existingRace.length) {
        return res.status(404).json({ message: "Razza non trovata" });
      }
      
      const raceSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        lore: z.string().optional().nullable(),
        traits: z.string().optional().nullable(),
        society: z.string().optional().nullable(),
        habitat: z.string().optional().nullable(),
        imageData: z.string().optional().nullable()
      });
      
      // Valida i dati
      const validatedData = raceSchema.parse(req.body);
      
      // Aggiorna la razza
      const [updatedRace] = await db.update(races)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .returning();
      
      return res.status(200).json({
        message: "Razza aggiornata con successo",
        race: updatedRace
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della razza non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nell'aggiornamento della razza:", error);
      return res.status(500).json({ message: "Errore nell'aggiornamento della razza" });
    }
  });
  
  // DELETE razza per ID
  app.delete("/api/races/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la razza esista e appartenga all'utente
      const existingRace = await db.select().from(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!existingRace.length) {
        return res.status(404).json({ message: "Razza non trovata" });
      }
      
      // Elimina la razza
      await db.delete(races)
        .where(and(
          eq(races.id, id),
          eq(races.userId, (req as any).userId)
        ));
      
      // Aggiorna il contatore delle razze nelle statistiche
      await db.select().from(userStats)
        .where(eq(userStats.userId, (req as any).userId))
        .limit(1)
        .then(async (stats) => {
          if (stats.length > 0 && stats[0].raceCount > 0) {
            await db.update(userStats)
              .set({
                raceCount: stats[0].raceCount - 1
              })
              .where(eq(userStats.userId, (req as any).userId));
          }
        });
      
      return res.status(200).json({
        message: "Razza eliminata con successo"
      });
    } catch (error) {
      console.error("Errore nell'eliminazione della razza:", error);
      return res.status(500).json({ message: "Errore nell'eliminazione della razza" });
    }
  });
  
  // API per le mappe (Maps)
  // ----------------------------------------------------
  
  // GET tutte le mappe
  app.get("/api/maps", async (req, res) => {
    try {
      const userMaps = await db.select().from(maps)
        .where(eq(maps.userId, (req as any).userId))
        .orderBy(asc(maps.name));
      
      return res.status(200).json(userMaps);
    } catch (error) {
      console.error("Errore nel recuperare le mappe:", error);
      return res.status(500).json({ message: "Errore nel recuperare le mappe" });
    }
  });
  
  // GET mappa per ID
  app.get("/api/maps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const map = await db.select().from(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!map.length) {
        return res.status(404).json({ message: "Mappa non trovata" });
      }
      
      return res.status(200).json(map[0]);
    } catch (error) {
      console.error("Errore nel recuperare la mappa:", error);
      return res.status(500).json({ message: "Errore nel recuperare la mappa" });
    }
  });
  
  // POST nuova mappa
  app.post("/api/maps", async (req, res) => {
    try {
      const mapSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        description: z.string().optional().nullable(),
        imageData: z.string().min(1, "L'immagine è obbligatoria"),
        points: z.array(z.any()).optional().nullable()
      });
      
      // Valida i dati
      const validatedData = mapSchema.parse(req.body);
      
      // Converti l'array di punti in formato JSON
      const points = validatedData.points 
        ? JSON.stringify(validatedData.points) 
        : '[]';
      
      // Crea una nuova mappa
      const [map] = await db.insert(maps)
        .values({
          id: generateId('map'),
          userId: (req as any).userId,
          name: validatedData.name,
          description: validatedData.description,
          imageData: validatedData.imageData,
          points
        })
        .returning();
      
      return res.status(201).json({
        message: "Mappa creata con successo",
        map
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della mappa non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nella creazione della mappa:", error);
      return res.status(500).json({ message: "Errore nella creazione della mappa" });
    }
  });
  
  // PUT aggiorna mappa per ID
  app.put("/api/maps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la mappa esista e appartenga all'utente
      const existingMap = await db.select().from(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!existingMap.length) {
        return res.status(404).json({ message: "Mappa non trovata" });
      }
      
      const mapSchema = z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        description: z.string().optional().nullable(),
        imageData: z.string().optional(),
        points: z.array(z.any()).optional()
      });
      
      // Valida i dati
      const validatedData = mapSchema.parse(req.body);
      
      // Converti l'array di punti in formato JSON
      const points = validatedData.points 
        ? JSON.stringify(validatedData.points) 
        : existingMap[0].points;
      
      // Prepara i dati per l'aggiornamento
      const updateData: any = {
        name: validatedData.name,
        description: validatedData.description,
        updatedAt: new Date()
      };
      
      // Aggiungi imageData solo se presente
      if (validatedData.imageData) {
        updateData.imageData = validatedData.imageData;
      }
      
      // Aggiungi points
      updateData.points = points;
      
      // Aggiorna la mappa
      const [updatedMap] = await db.update(maps)
        .set(updateData)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .returning();
      
      return res.status(200).json({
        message: "Mappa aggiornata con successo",
        map: updatedMap
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati della mappa non validi", 
          errors: error.errors 
        });
      }
      
      console.error("Errore nell'aggiornamento della mappa:", error);
      return res.status(500).json({ message: "Errore nell'aggiornamento della mappa" });
    }
  });
  
  // DELETE mappa per ID
  app.delete("/api/maps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Controlla che la mappa esista e appartenga all'utente
      const existingMap = await db.select().from(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ))
        .limit(1);
      
      if (!existingMap.length) {
        return res.status(404).json({ message: "Mappa non trovata" });
      }
      
      // Elimina la mappa
      await db.delete(maps)
        .where(and(
          eq(maps.id, id),
          eq(maps.userId, (req as any).userId)
        ));
      
      return res.status(200).json({
        message: "Mappa eliminata con successo"
      });
    } catch (error) {
      console.error("Errore nell'eliminazione della mappa:", error);
      return res.status(500).json({ message: "Errore nell'eliminazione della mappa" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Funzione per verificare e aggiornare gli achievement in base alle statistiche
async function checkAndUpdateAchievements(userStats: any) {
  try {
    // Recupera tutti gli achievement
    const allAchievements = await db.select().from(achievementDefinitions);
    
    // Recupera gli achievement già sbloccati dall'utente
    const userAchievementsList = await db.select().from(userAchievements)
      .where(eq(userAchievements.userId, userStats.userId));
    
    // Mappa degli achievement già tracciati dall'utente
    const userAchievementsMap: Record<string, any> = {};
    userAchievementsList.forEach(achievement => {
      userAchievementsMap[achievement.achievementId] = achievement;
    });
    
    // Esamina ogni achievement e verifica se deve essere aggiornato
    for (const achievement of allAchievements) {
      const userAchievement = userAchievementsMap[achievement.id];
      
      // Salta se l'achievement è già sbloccato
      if (userAchievement && userAchievement.unlocked) {
        continue;
      }
      
      // Recupera il valore attuale della statistica da controllare
      let statValue = 0;
      
      // Ottieni il valore corretto dalla tipologia di statistica
      switch(achievement.statType) {
        case 'wordCount':
        case 'wordCountTotal':
          statValue = userStats.wordCount;
          break;
        case 'wordCountToday':
          statValue = userStats.wordCountToday;
          break;
        case 'wordCountWeek':
          statValue = userStats.wordCountWeek;
          break;
        case 'characterCount':
          statValue = userStats.characterCount;
          break;
        case 'placeCount':
          statValue = userStats.placeCount;
          break;
        case 'eventCount':
          statValue = userStats.eventCount;
          break;
        case 'raceCount':
          statValue = userStats.raceCount;
          break;
        case 'sessionsCompleted':
          statValue = userStats.sessionsCompleted;
          break;
        case 'wordsPerDay':
          statValue = userStats.wordsPerDay;
          break;
        case 'dailyGoalStreak':
          statValue = userStats.dailyGoalStreak;
          break;
        case 'writeStreak':
          statValue = userStats.writeStreak;
          break;
        case 'writeTime':
          statValue = userStats.writeTime;
          break;
        case 'writingSpeed':
          statValue = userStats.writingSpeed;
          break;
      }
      
      // Calcola percentuale di progresso (0-100)
      const progress = Math.min(100, Math.floor((statValue / achievement.threshold) * 100));
      
      // Determina se l'achievement è sbloccato
      const unlocked = statValue >= achievement.threshold;
      
      if (userAchievement) {
        // Aggiorna l'achievement esistente
        if (unlocked || progress > userAchievement.progress) {
          await db.update(userAchievements)
            .set({
              unlocked,
              progress,
              unlockDate: unlocked && !userAchievement.unlocked ? new Date() : userAchievement.unlockDate
            })
            .where(and(
              eq(userAchievements.userId, userStats.userId),
              eq(userAchievements.achievementId, achievement.id)
            ));
          
          // Se l'achievement è stato appena sbloccato, aggiorna l'esperienza
          if (unlocked && !userAchievement.unlocked) {
            await db.update(userStats)
              .set({
                experience: userStats.experience + achievement.xp
              })
              .where(eq(userStats.id, userStats.id));
          }
        }
      } else {
        // Crea un nuovo record per l'achievement
        await db.insert(userAchievements)
          .values({
            userId: userStats.userId,
            achievementId: achievement.id,
            unlocked,
            progress,
            unlockDate: unlocked ? new Date() : null
          });
        
        // Se l'achievement è stato sbloccato, aggiorna l'esperienza
        if (unlocked) {
          await db.update(userStats)
            .set({
              experience: userStats.experience + achievement.xp
            })
            .where(eq(userStats.id, userStats.id));
        }
      }
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento degli achievement:", error);
  }
}
