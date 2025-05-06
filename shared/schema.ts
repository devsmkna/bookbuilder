import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, jsonb, foreignKey, primaryKey, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Utenti
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const usersRelations = relations(users, ({ one, many }) => ({
  userStats: one(userStats),
  achievements: many(userAchievements),
  writingSessions: many(writingSessions)
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Enum per i tipi di entità nel sistema di gamification
export const entityTypeEnum = pgEnum('entity_type', [
  'character', 
  'place', 
  'race', 
  'event'
]);

// Enum per le categorie di achievement
export const achievementCategoryEnum = pgEnum('achievement_category', [
  'writing', 
  'character', 
  'world', 
  'commitment', 
  'milestone', 
  'challenge'
]);

// Statistiche dell'utente
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Contatori principali
  wordCount: integer("word_count").notNull().default(0),
  wordCountToday: integer("word_count_today").notNull().default(0),
  wordCountWeek: integer("word_count_week").notNull().default(0),
  characterCount: integer("character_count").notNull().default(0),
  placeCount: integer("place_count").notNull().default(0),
  eventCount: integer("event_count").notNull().default(0),
  raceCount: integer("race_count").notNull().default(0),
  
  // Metriche di impegno
  sessionsCompleted: integer("sessions_completed").notNull().default(0),
  wordsPerDay: integer("words_per_day").notNull().default(0),
  dailyGoalReached: boolean("daily_goal_reached").notNull().default(false),
  dailyGoalStreak: integer("daily_goal_streak").notNull().default(0),
  writeStreak: integer("write_streak").notNull().default(0),
  longestWriteStreak: integer("longest_write_streak").notNull().default(0),
  
  // Tempo di scrittura
  writeTime: integer("write_time").notNull().default(0), // In minuti
  writingSpeed: integer("writing_speed").notNull().default(0), // Parole al minuto
  
  // Preferenze
  dailyWordGoal: integer("daily_word_goal").notNull().default(1000),
  theme: text("theme").notNull().default('light'),
  
  // Esperienza e livello
  experience: integer("experience").notNull().default(0),
  level: integer("level").notNull().default(1),
  
  // Ultima attività
  lastActiveDate: date("last_active_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id]
  })
}));

// Schema per inserimento e selezione delle statistiche
export const userStatsInsertSchema = createInsertSchema(userStats);
export const userStatsSelectSchema = createSelectSchema(userStats);
export type UserStatsInsert = z.infer<typeof userStatsInsertSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Achievement di base definiti nel sistema
export const achievementDefinitions = pgTable("achievement_definitions", {
  id: text("id").primaryKey(), // Chiave come 'writing-1', 'character-3', ecc
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: achievementCategoryEnum("category").notNull(),
  xp: integer("xp").notNull().default(10),
  icon: text("icon"),
  statType: text("stat_type").notNull(), // Tipo di statistica da monitorare
  threshold: integer("threshold").notNull() // Valore da raggiungere per sbloccare
});

// Achievement sbloccati dall'utente
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: text("achievement_id").notNull().references(() => achievementDefinitions.id),
  unlocked: boolean("unlocked").notNull().default(false),
  progress: integer("progress").notNull().default(0), // Progresso da 0 a 100
  unlockDate: timestamp("unlock_date"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievementDefinitions, {
    fields: [userAchievements.achievementId],
    references: [achievementDefinitions.id]
  })
}));

// Sessioni di scrittura dell'utente
export const writingSessions = pgTable("writing_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  wordCount: integer("word_count").notNull().default(0),
  duration: integer("duration").notNull().default(0), // Durata in minuti
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  date: date("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const writingSessionsRelations = relations(writingSessions, ({ one }) => ({
  user: one(users, {
    fields: [writingSessions.userId],
    references: [users.id]
  })
}));

// Schema per inserimento e selezione delle sessioni
export const writingSessionInsertSchema = createInsertSchema(writingSessions);
export const writingSessionSelectSchema = createSelectSchema(writingSessions);
export type WritingSessionInsert = z.infer<typeof writingSessionInsertSchema>;
export type WritingSession = typeof writingSessions.$inferSelect;

// Documenti dell'utente (contenuto Markdown dell'editor)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull().default('Nuovo Documento'),
  content: text("content").notNull().default(''),
  wordCount: integer("word_count").notNull().default(0),
  charCount: integer("char_count").notNull().default(0),
  lastEdited: timestamp("last_edited").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  })
}));

// Schema per inserimento e selezione dei documenti
export const documentInsertSchema = createInsertSchema(documents);
export const documentSelectSchema = createSelectSchema(documents);
export type DocumentInsert = z.infer<typeof documentInsertSchema>;
export type Document = typeof documents.$inferSelect;

// Mappatura tra entità linkate e documenti
export const entityLinks = pgTable("entity_links", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id, { onDelete: 'cascade' }),
  entityId: text("entity_id").notNull(), // ID dell'entità (personaggio, luogo, ecc)
  entityType: entityTypeEnum("entity_type").notNull(), // Tipo di entità
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const entityLinksRelations = relations(entityLinks, ({ one }) => ({
  document: one(documents, {
    fields: [entityLinks.documentId],
    references: [documents.id]
  })
}));
