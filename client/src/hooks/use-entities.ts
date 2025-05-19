import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

// Tipi per le risposte dalle API
interface ApiResponse<T> {
  message?: string;
  [key: string]: any;
}

// Tipi di entità
export type EntityType = 'character' | 'place' | 'race' | 'event' | 'map';

// Interfacce base per le entità
export interface BaseEntity {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Character extends BaseEntity {
  pronunciation?: string;
  aliases?: string;
  age?: string;
  race?: string;
  imageData?: string;
  eyeColor?: string;
  secondEyeColor?: string;
  hasHeterochromia?: boolean;
  hairColor?: string;
  skinColor?: string;
  height?: string;
  bodyType?: string;
  attitude?: string;
  bodyLanguage?: string;
  bodySigns?: string;
  parentalRelationship?: string;
  parentalTeachings?: string;
  respect?: string;
  hates?: string;
  fears?: string;
  contradictions?: string;
  dreams?: string;
  sacrificeForDreams?: string;
  values?: string;
  antiValues?: string;
  motivationEvolution?: string;
  emotionalEvolution?: string;
  relationshipEvolution?: string;
  dreamEvolution?: string;
  completionPercentage?: number;
}

export interface Race extends BaseEntity {
  lore?: string;
  traits?: string;
  society?: string;
  habitat?: string;
  imageData?: string;
}

export interface Map extends BaseEntity {
  imageData: string;
  points?: any[];
}

export interface Event extends BaseEntity {
  date?: string;
  importance?: number;
  involvedCharacters?: string[];
  locations?: string[];
}

// Helpers di utilità per le chiamate API
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  return data as T;
};

/**
 * Hook per gestire i personaggi
 */
export function useCharacters() {
  const queryClient = useQueryClient();
  
  // Carica tutti i personaggi
  const { data: characters = [], isLoading, error } = useQuery({
    queryKey: ['/api/characters'],
    staleTime: 1000 * 60 * 5, // 5 minuti
  });
  
  // Crea un nuovo personaggio
  const createCharacter = useMutation({
    mutationFn: async (character: Partial<Character>) => {
      const response = await apiRequest('POST', '/api/characters', character);
      return handleApiResponse<ApiResponse<Character>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    },
  });
  
  // Aggiorna un personaggio esistente
  const updateCharacter = useMutation({
    mutationFn: async (character: Partial<Character> & { id: string }) => {
      const { id, ...data } = character;
      const response = await apiRequest('PUT', `/api/characters/${id}`, data);
      return handleApiResponse<ApiResponse<Character>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    },
  });
  
  // Elimina un personaggio
  const deleteCharacter = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await apiRequest('DELETE', `/api/characters/${characterId}`);
      return handleApiResponse<ApiResponse<void>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    },
  });
  
  return {
    characters,
    isLoading,
    error,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  };
}

/**
 * Hook per gestire le razze
 */
export function useRaces() {
  const queryClient = useQueryClient();
  
  // Carica tutte le razze
  const { data: races = [], isLoading, error } = useQuery({
    queryKey: ['/api/races'],
    staleTime: 1000 * 60 * 5, // 5 minuti
  });
  
  // Crea una nuova razza
  const createRace = useMutation({
    mutationFn: async (race: Partial<Race>) => {
      const response = await apiRequest('POST', '/api/races', race);
      return handleApiResponse<ApiResponse<Race>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/races'] });
    },
  });
  
  // Aggiorna una razza esistente
  const updateRace = useMutation({
    mutationFn: async (race: Partial<Race> & { id: string }) => {
      const { id, ...data } = race;
      const response = await apiRequest('PUT', `/api/races/${id}`, data);
      return handleApiResponse<ApiResponse<Race>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/races'] });
    },
  });
  
  // Elimina una razza
  const deleteRace = useMutation({
    mutationFn: async (raceId: string) => {
      const response = await apiRequest('DELETE', `/api/races/${raceId}`);
      return handleApiResponse<ApiResponse<void>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/races'] });
    },
  });
  
  return {
    races,
    isLoading,
    error,
    createRace,
    updateRace,
    deleteRace,
  };
}

/**
 * Hook per gestire le mappe
 */
export function useMaps() {
  const queryClient = useQueryClient();
  
  // Carica tutte le mappe
  const { data: maps = [], isLoading, error } = useQuery({
    queryKey: ['/api/maps'],
    staleTime: 1000 * 60 * 5, // 5 minuti
  });
  
  // Crea una nuova mappa
  const createMap = useMutation({
    mutationFn: async (map: Partial<Map>) => {
      const response = await apiRequest('POST', '/api/maps', map);
      return handleApiResponse<ApiResponse<Map>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maps'] });
    },
  });
  
  // Aggiorna una mappa esistente
  const updateMap = useMutation({
    mutationFn: async (map: Partial<Map> & { id: string }) => {
      const { id, ...data } = map;
      const response = await apiRequest('PUT', `/api/maps/${id}`, data);
      return handleApiResponse<ApiResponse<Map>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maps'] });
    },
  });
  
  // Elimina una mappa
  const deleteMap = useMutation({
    mutationFn: async (mapId: string) => {
      const response = await apiRequest('DELETE', `/api/maps/${mapId}`);
      return handleApiResponse<ApiResponse<void>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maps'] });
    },
  });
  
  return {
    maps,
    isLoading,
    error,
    createMap,
    updateMap,
    deleteMap,
  };
}

/**
 * Hook per gestire gli eventi
 */
export function useEvents() {
  const queryClient = useQueryClient();
  
  // Carica tutti gli eventi
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['/api/events'],
    staleTime: 1000 * 60 * 5, // 5 minuti
  });
  
  // Crea un nuovo evento
  const createEvent = useMutation({
    mutationFn: async (event: Partial<Event>) => {
      const response = await apiRequest('POST', '/api/events', event);
      return handleApiResponse<ApiResponse<Event>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });
  
  // Aggiorna un evento esistente
  const updateEvent = useMutation({
    mutationFn: async (event: Partial<Event> & { id: string }) => {
      const { id, ...data } = event;
      const response = await apiRequest('PUT', `/api/events/${id}`, data);
      return handleApiResponse<ApiResponse<Event>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });
  
  // Elimina un evento
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}`);
      return handleApiResponse<ApiResponse<void>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });
  
  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

/**
 * Hook per gestire i documenti dell'editor
 */
export function useDocuments() {
  const queryClient = useQueryClient();
  
  // Carica tutti i documenti
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['/api/documents'],
    staleTime: 1000 * 60 * 5, // 5 minuti
  });
  
  // Carica un documento specifico
  const getDocument = useCallback(async (documentId: number) => {
    const response = await apiRequest('GET', `/api/documents/${documentId}`);
    return handleApiResponse(response);
  }, []);
  
  // Crea un nuovo documento
  const createDocument = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const response = await apiRequest('POST', '/api/documents', { title, content });
      return handleApiResponse<ApiResponse<any>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });
  
  // Aggiorna un documento esistente
  const updateDocument = useMutation({
    mutationFn: async ({ id, title, content }: { id: number; title: string; content: string }) => {
      const response = await apiRequest('PUT', `/api/documents/${id}`, { title, content });
      return handleApiResponse<ApiResponse<any>>(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${variables.id}`] });
    },
  });
  
  // Elimina un documento
  const deleteDocument = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest('DELETE', `/api/documents/${documentId}`);
      return handleApiResponse<ApiResponse<void>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
  });
  
  // Carica l'ultimo documento modificato
  const getLastEditedDocument = useCallback(async () => {
    if (!documents || (documents as any[]).length === 0) return null;
    
    // Ordina i documenti per data di ultima modifica
    const sortedDocuments = [...(documents as any[])].sort((a: any, b: any) => 
      new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()
    );
    
    if (sortedDocuments.length > 0) {
      return getDocument(sortedDocuments[0].id);
    }
    
    return null;
  }, [documents, getDocument]);
  
  return {
    documents,
    isLoading,
    error,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    getLastEditedDocument,
  };
}

/**
 * Hook per la migrazione di dati da localStorage al database
 */
export function useDataMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const { createEvent } = useEvents();
  const { createCharacter } = useCharacters();
  const { createRace } = useRaces();
  const { createMap } = useMaps();
  
  // Migra i dati da localStorage al database
  const migrateLocalStorageToDatabase = useCallback(async () => {
    setIsMigrating(true);
    try {
      // Migra eventi
      const localEvents = localStorage.getItem('events');
      if (localEvents) {
        const events = JSON.parse(localEvents);
        for (const event of events) {
          await createEvent.mutateAsync({
            id: event.id,
            name: event.name,
            description: event.description,
            date: event.date,
            importance: event.importance || 0,
            involvedCharacters: event.involvedCharacters || [],
            locations: event.locations || []
          });
        }
      }
      
      // Migra personaggi
      const localCharacters = localStorage.getItem('characters');
      if (localCharacters) {
        const characters = JSON.parse(localCharacters);
        for (const character of characters) {
          await createCharacter.mutateAsync(character);
        }
      }
      
      // Migra razze
      const localRaces = localStorage.getItem('races');
      if (localRaces) {
        const races = JSON.parse(localRaces);
        for (const race of races) {
          await createRace.mutateAsync(race);
        }
      }
      
      // Migra mappe
      const localMaps = localStorage.getItem('maps');
      if (localMaps) {
        const maps = JSON.parse(localMaps);
        for (const map of maps) {
          await createMap.mutateAsync(map);
        }
      }
      
      // Pulisci localStorage dopo la migrazione
      // localStorage.removeItem('events');
      // localStorage.removeItem('characters');
      // localStorage.removeItem('races');
      // localStorage.removeItem('maps');
      
      setMigrationComplete(true);
    } catch (error) {
      console.error('Errore durante la migrazione:', error);
    } finally {
      setIsMigrating(false);
    }
  }, [createEvent, createCharacter, createRace, createMap]);
  
  return {
    isMigrating,
    migrationComplete,
    migrateLocalStorageToDatabase
  };
}

/**
 * Hook per la ricerca globale di entità
 */
export function useEntitySearch() {
  const { characters } = useCharacters();
  const { races } = useRaces();
  const { maps } = useMaps();
  const { events } = useEvents();
  const { documents } = useDocuments();
  
  const searchEntities = useCallback((query: string) => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    const results: any[] = [];
    
    // Cerca nei personaggi
    if (characters && Array.isArray(characters)) {
      characters.forEach((character: Character) => {
        if (character.name.toLowerCase().includes(lowerQuery) || 
            (character.description && character.description.toLowerCase().includes(lowerQuery))) {
          results.push({
            id: character.id,
            name: character.name,
            type: 'character',
            description: character.description
          });
        }
      });
    }
    
    // Cerca nelle razze
    if (races && Array.isArray(races)) {
      races.forEach((race: Race) => {
        if (race.name.toLowerCase().includes(lowerQuery) || 
            (race.description && race.description.toLowerCase().includes(lowerQuery))) {
          results.push({
            id: race.id,
            name: race.name,
            type: 'race',
            description: race.description
          });
        }
      });
    }
    
    // Cerca nelle mappe
    if (maps && Array.isArray(maps)) {
      maps.forEach((map: Map) => {
        if (map.name.toLowerCase().includes(lowerQuery) || 
            (map.description && map.description.toLowerCase().includes(lowerQuery))) {
          results.push({
            id: map.id,
            name: map.name,
            type: 'map',
            description: map.description
          });
        }
      });
    }
    
    // Cerca negli eventi
    if (events && Array.isArray(events)) {
      events.forEach((event: Event) => {
        if (event.name.toLowerCase().includes(lowerQuery) || 
            (event.description && event.description.toLowerCase().includes(lowerQuery))) {
          results.push({
            id: event.id,
            name: event.name,
            type: 'event',
            description: event.description
          });
        }
      });
    }
    
    // Cerca nei documenti
    if (documents && Array.isArray(documents)) {
      documents.forEach((document: any) => {
        if (document.title.toLowerCase().includes(lowerQuery) || 
            (document.content && document.content.toLowerCase().includes(lowerQuery))) {
          // Trova il contesto della corrispondenza nel contenuto
          let context = '';
          if (document.content) {
            const index = document.content.toLowerCase().indexOf(lowerQuery);
            if (index >= 0) {
              const start = Math.max(0, index - 40);
              const end = Math.min(document.content.length, index + lowerQuery.length + 40);
              context = document.content.substring(start, end);
              if (start > 0) context = '...' + context;
              if (end < document.content.length) context = context + '...';
            }
          }
          
          results.push({
            id: document.id,
            name: document.title,
            type: 'document',
            description: document.content ? `${document.content.substring(0, 100)}...` : '',
            context,
            match: context ? {
              start: context.indexOf(lowerQuery),
              end: context.indexOf(lowerQuery) + lowerQuery.length
            } : undefined
          });
        }
      });
    }
    
    return results;
  }, [characters, races, maps, events, documents]);
  
  return { searchEntities };
}