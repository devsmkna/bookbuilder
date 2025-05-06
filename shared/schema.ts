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

// Relazioni utente definite più in dettaglio dopo aver creato tutte le tabelle

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
  'event',
  'map'
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

// Personaggi
export const characters = pgTable("characters", {
  id: text("id").primaryKey(), // UUID o altro identificatore univoco
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Informazioni di base
  name: text("name").notNull(),
  pronunciation: text("pronunciation"),
  aliases: text("aliases"),
  age: text("age"),
  race: text("race"),
  imageData: text("image_data"), // Base64 encoded image
  
  // Tratti fisici
  eyeColor: text("eye_color"),
  secondEyeColor: text("second_eye_color"), // Per occhi eterochromici
  hasHeterochromia: boolean("has_heterochromia").default(false),
  hairColor: text("hair_color"),
  skinColor: text("skin_color"),
  height: text("height"),
  bodyType: text("body_type"),

  // Comportamento
  attitude: text("attitude"),
  bodyLanguage: text("body_language"),
  bodySigns: text("body_signs"),
  
  // Personale
  parentalRelationship: text("parental_relationship"),
  parentalTeachings: text("parental_teachings"),
  respect: text("respect"),
  hates: text("hates"),
  fears: text("fears"),
  contradictions: text("contradictions"),
  dreams: text("dreams"),
  sacrificeForDreams: text("sacrifice_for_dreams"),
  values: text("values"),
  antiValues: text("anti_values"),
  
  // Evoluzione
  motivationEvolution: text("motivation_evolution"),
  emotionalEvolution: text("emotional_evolution"),
  relationshipEvolution: text("relationship_evolution"),
  dreamEvolution: text("dream_evolution"),
  
  // Metadati
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id]
  })
}));

export const characterInsertSchema = createInsertSchema(characters);
export const characterSelectSchema = createSelectSchema(characters);
export type CharacterInsert = z.infer<typeof characterInsertSchema>;
export type Character = typeof characters.$inferSelect;

// Razze
export const races = pgTable("races", {
  id: text("id").primaryKey(), // UUID o altro identificatore univoco
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Informazioni di base
  name: text("name").notNull(),
  lore: text("lore"), // Storia e background
  traits: text("traits"), // Caratteristiche fisiche e comportamentali
  society: text("society"), // Organizzazione sociale
  habitat: text("habitat"), // Ambiente in cui vivono
  imageData: text("image_data"), // Base64 encoded image
  
  // Metadati
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const racesRelations = relations(races, ({ one }) => ({
  user: one(users, {
    fields: [races.userId],
    references: [users.id]
  })
}));

export const raceInsertSchema = createInsertSchema(races);
export const raceSelectSchema = createSelectSchema(races);
export type RaceInsert = z.infer<typeof raceInsertSchema>;
export type Race = typeof races.$inferSelect;

// Mappe
export const maps = pgTable("maps", {
  id: text("id").primaryKey(), // UUID o altro identificatore univoco
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Informazioni di base
  name: text("name").notNull(),
  description: text("description"),
  imageData: text("image_data").notNull(), // Base64 encoded image
  
  // Coordinate dei punti di interesse sulla mappa (in formato JSON)
  points: jsonb("points").default('[]'),
  
  // Metadati
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const mapsRelations = relations(maps, ({ one }) => ({
  user: one(users, {
    fields: [maps.userId],
    references: [users.id]
  })
}));

export const mapInsertSchema = createInsertSchema(maps);
export const mapSelectSchema = createSelectSchema(maps);
export type MapInsert = z.infer<typeof mapInsertSchema>;
export type Map = typeof maps.$inferSelect;

// Eventi
export const events = pgTable("events", {
  id: text("id").primaryKey(), // UUID o altro identificatore univoco
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Informazioni di base
  name: text("name").notNull(),
  description: text("description"),
  date: text("date"), // Data dell'evento nel mondo della storia
  importance: integer("importance").default(0), // Scala 0-10 dell'importanza
  
  // Relazioni
  involvedCharacters: jsonb("involved_characters").default('[]'), // IDs dei personaggi coinvolti
  locations: jsonb("locations").default('[]'), // Luoghi in cui si svolge
  
  // Metadati
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  })
}));

export const eventInsertSchema = createInsertSchema(events);
export const eventSelectSchema = createSelectSchema(events);
export type EventInsert = z.infer<typeof eventInsertSchema>;
export type Event = typeof events.$inferSelect;

// Relazioni utente complete che includono tutte le entità
export const usersRelations = relations(users, ({ one, many }) => ({
  userStats: one(userStats),
  achievements: many(userAchievements),
  writingSessions: many(writingSessions),
  characters: many(characters),
  races: many(races),
  maps: many(maps),
  events: many(events)
}));
