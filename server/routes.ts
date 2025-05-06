import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import {
  users,
  userStats,
  userAchievements,
  achievementDefinitions,
  writingSessions,
  documents
} from "../shared/schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

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
        updates.dailyGoalReached = true;
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
      const userAchievements = await db.select().from(userAchievements)
        .where(and(
          eq(userAchievements.userId, (req as any).userId),
          eq(userAchievements.achievementId, id)
        ))
        .limit(1);
      
      let result;
      
      if (userAchievements.length > 0) {
        const userAchievement = userAchievements[0];
        
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
      
      // Crea una nuova sessione di scrittura
      const [session] = await db.insert(writingSessions)
        .values({
          userId: (req as any).userId,
          wordCount: validatedData.wordCount,
          duration: validatedData.duration,
          startTime: validatedData.startTime ? new Date(validatedData.startTime) : new Date(),
          endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
          date: validatedData.date ? new Date(validatedData.date) : new Date()
        })
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
  app.get("/api/writing-sessions", async (req, res) => {
    try {
      // Parametri di filtro per data
      const { startDate, endDate } = req.query;
      
      let query = db.select().from(writingSessions)
        .where(eq(writingSessions.userId, (req as any).userId))
        .orderBy(desc(writingSessions.date));
      
      // Applica filtri opzionali
      if (startDate) {
        query = query.where(gte(writingSessions.date, new Date(startDate as string)));
      }
      
      if (endDate) {
        query = query.where(lte(writingSessions.date, new Date(endDate as string)));
      }
      
      const sessions = await query;
      
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Errore nel recuperare le sessioni di scrittura:", error);
      return res.status(500).json({ message: "Errore nel recuperare le sessioni di scrittura" });
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
