import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Inizializzazione database in corso...");
    
    // Inizializza gli achievement
    await seedAchievements();
    
    console.log("Database inizializzato con successo!");
  } catch (error) {
    console.error("Errore durante l'inizializzazione del database:", error);
  }
}

async function seedAchievements() {
  console.log("Inizializzazione degli achievement...");
  
  // Lista di achievement
  const achievements = [
    // Achievement di scrittura
    {
      id: 'writing-1',
      title: 'Prime Parole',
      description: 'Scrivi le tue prime 100 parole',
      category: 'writing' as const,
      xp: 10,
      icon: 'pencil',
      statType: 'wordCount',
      threshold: 100
    },
    {
      id: 'writing-2',
      title: 'Autore in Erba',
      description: 'Raggiungi 500 parole nel tuo scritto',
      category: 'writing' as const,
      xp: 20,
      icon: 'book',
      statType: 'wordCount',
      threshold: 500
    },
    {
      id: 'writing-3',
      title: 'Primo Capitolo',
      description: 'Raggiungi 1.000 parole nel tuo scritto',
      category: 'writing' as const,
      xp: 30,
      icon: 'book-open',
      statType: 'wordCount',
      threshold: 1000
    },
    {
      id: 'writing-4',
      title: 'Racconto Breve',
      description: 'Raggiungi 2.500 parole nel tuo scritto',
      category: 'writing' as const,
      xp: 50,
      icon: 'book-open',
      statType: 'wordCount',
      threshold: 2500
    },
    {
      id: 'writing-5',
      title: 'Scrittore Prolisso',
      description: 'Raggiungi 5.000 parole nel tuo scritto',
      category: 'writing' as const,
      xp: 75,
      icon: 'book',
      statType: 'wordCount',
      threshold: 5000
    },
    {
      id: 'writing-6',
      title: 'Novellista',
      description: 'Raggiungi 10.000 parole nel tuo scritto',
      category: 'writing' as const,
      xp: 100,
      icon: 'library',
      statType: 'wordCount',
      threshold: 10000
    },
    {
      id: 'writing-7',
      title: 'Romanziere',
      description: 'Raggiungi 25.000 parole nel tuo scritto',
      category: 'writing' as const,
      xp: 200,
      icon: 'book-text',
      statType: 'wordCount',
      threshold: 25000
    },
    
    // Achievement giornalieri
    {
      id: 'daily-1',
      title: 'Scintilla Creativa',
      description: 'Scrivi almeno 100 parole in un giorno',
      category: 'commitment' as const,
      xp: 10,
      icon: 'zap',
      statType: 'wordCountToday',
      threshold: 100
    },
    {
      id: 'daily-2',
      title: 'Flusso di Idee',
      description: 'Scrivi almeno 500 parole in un giorno',
      category: 'commitment' as const,
      xp: 20,
      icon: 'zap',
      statType: 'wordCountToday',
      threshold: 500
    },
    {
      id: 'daily-3',
      title: 'Ispirazione Potente',
      description: 'Scrivi almeno 1.000 parole in un giorno',
      category: 'commitment' as const,
      xp: 30,
      icon: 'rocket',
      statType: 'wordCountToday',
      threshold: 1000
    },
    
    // Achievement di costanza
    {
      id: 'streak-1',
      title: 'Primi Passi',
      description: 'Scrivi per 3 giorni consecutivi',
      category: 'commitment' as const,
      xp: 30,
      icon: 'calendar',
      statType: 'writeStreak',
      threshold: 3
    },
    {
      id: 'streak-2',
      title: 'Abitudine in Formazione',
      description: 'Scrivi per 7 giorni consecutivi',
      category: 'commitment' as const,
      xp: 75,
      icon: 'calendar-check',
      statType: 'writeStreak',
      threshold: 7
    },
    {
      id: 'streak-3',
      title: 'Disciplina dello Scrittore',
      description: 'Scrivi per 14 giorni consecutivi',
      category: 'commitment' as const,
      xp: 150,
      icon: 'calendar-check',
      statType: 'writeStreak',
      threshold: 14
    },
    
    // Achievement per personaggi
    {
      id: 'character-1',
      title: 'Primo Personaggio',
      description: 'Crea il tuo primo personaggio',
      category: 'character' as const,
      xp: 25,
      icon: 'user',
      statType: 'characterCount',
      threshold: 1
    },
    {
      id: 'character-2',
      title: 'Cast di Supporto',
      description: 'Crea 3 diversi personaggi',
      category: 'character' as const,
      xp: 50,
      icon: 'users',
      statType: 'characterCount',
      threshold: 3
    },
    {
      id: 'character-3',
      title: 'Direttore del Cast',
      description: 'Crea 5 diversi personaggi',
      category: 'character' as const,
      xp: 75,
      icon: 'users',
      statType: 'characterCount',
      threshold: 5
    },
    
    // Achievement per luoghi
    {
      id: 'place-1',
      title: 'Architetto',
      description: 'Crea il tuo primo luogo',
      category: 'world' as const,
      xp: 25,
      icon: 'map-pin',
      statType: 'placeCount',
      threshold: 1
    },
    {
      id: 'place-2',
      title: 'Cartografo',
      description: 'Crea 3 diversi luoghi',
      category: 'world' as const,
      xp: 50,
      icon: 'map',
      statType: 'placeCount',
      threshold: 3
    },
    
    // Achievement per razze
    {
      id: 'race-1',
      title: 'Biologo Fantastico',
      description: 'Crea la tua prima razza',
      category: 'world' as const,
      xp: 25,
      icon: 'leaf',
      statType: 'raceCount',
      threshold: 1
    },
    
    // Achievement per eventi
    {
      id: 'event-1',
      title: 'Primo Atto',
      description: 'Crea il tuo primo evento nella storia',
      category: 'milestone' as const,
      xp: 25,
      icon: 'star',
      statType: 'eventCount',
      threshold: 1
    },
    
    // Achievement per tempo di scrittura
    {
      id: 'time-1',
      title: 'Primo Sprint',
      description: 'Trascorri 1 ora scrivendo',
      category: 'commitment' as const,
      xp: 20,
      icon: 'clock',
      statType: 'writeTime',
      threshold: 60
    },
    {
      id: 'time-2',
      title: 'Scrittore Costante',
      description: 'Trascorri 5 ore scrivendo',
      category: 'commitment' as const,
      xp: 50,
      icon: 'clock',
      statType: 'writeTime',
      threshold: 300
    }
  ];
  
  // Ottieni achievement esistenti
  const existingAchievements = await db.select().from(schema.achievementDefinitions);
  
  // Filtra gli achievement da inserire (solo quelli non già presenti)
  const achievementsToInsert = achievements.filter(achievement => 
    !existingAchievements.some(existing => existing.id === achievement.id)
  );
  
  if (achievementsToInsert.length > 0) {
    // Inserisci gli achievement in batch
    await db.insert(schema.achievementDefinitions).values(achievementsToInsert);
    console.log(`Aggiunti ${achievementsToInsert.length} nuovi achievement.`);
  } else {
    console.log("Nessun nuovo achievement da aggiungere.");
  }
}

// Esegui la funzione di seed
seed();
