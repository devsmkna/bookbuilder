// Servizio per l'esportazione e l'importazione del progetto

/**
 * Interfaccia che definisce la struttura di un progetto completo
 */
export interface ProjectData {
  // Metadati del progetto
  metadata: {
    name: string;
    description?: string;
    version: string;
    createdAt: string;
    exportedAt: string;
  };
  
  // Contenuto dell'editor
  editorContent?: string;
  
  // Entità
  characters: any[];
  places: any[];
  maps: any[];
  races: any[];
  events: any[];
  
  // Altri dati come impostazioni, etc.
  settings?: Record<string, any>;
}

/**
 * Classe che fornisce funzionalità per esportare e importare progetti
 */
export class ProjectExportService {
  /**
   * Esporta l'intero progetto in un oggetto JSON
   */
  static exportProject(projectName: string, projectDescription?: string): ProjectData {
    // Recupera tutti i dati dalle varie fonti
    const now = new Date();
    
    // Contenuto dell'editor
    const editorContent = localStorage.getItem('editor_content') || '';
    
    // Recupera personaggi
    const charactersData = localStorage.getItem('characters');
    const characters = charactersData ? JSON.parse(charactersData) : [];
    
    // Recupera mappe e luoghi
    const mapsData = localStorage.getItem('maps');
    const maps = mapsData ? JSON.parse(mapsData) : [];
    
    // Estrai luoghi dalle mappe
    let places: any[] = [];
    maps.forEach((map: any) => {
      if (map.places && Array.isArray(map.places)) {
        places = [...places, ...map.places];
      }
    });
    
    // Recupera razze
    const racesData = localStorage.getItem('races');
    const races = racesData ? JSON.parse(racesData) : [];
    
    // Recupera eventi
    const eventsData = localStorage.getItem('events');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    // Recupera altre impostazioni del progetto
    const settings: Record<string, any> = {};
    
    // Salva le altre impostazioni rilevanti
    // Esempio: tema, dimensione dei font, etc.
    const theme = localStorage.getItem('book-builder-theme');
    if (theme) settings.theme = theme;
    
    // Costruisci l'oggetto del progetto
    const projectData: ProjectData = {
      metadata: {
        name: projectName,
        description: projectDescription,
        version: '1.0',
        createdAt: now.toISOString(),
        exportedAt: now.toISOString()
      },
      editorContent,
      characters,
      maps,
      places,
      races,
      events,
      settings
    };
    
    return projectData;
  }
  
  /**
   * Converte i dati del progetto in un file JSON da scaricare
   */
  static createExportFile(projectData: ProjectData): string {
    return JSON.stringify(projectData, null, 2);
  }
  
  /**
   * Importa un progetto da un file JSON
   */
  static importProject(jsonData: string): ProjectData | null {
    try {
      const projectData: ProjectData = JSON.parse(jsonData);
      
      // Verifica se il file ha il formato corretto
      if (!projectData.metadata || !projectData.metadata.version) {
        throw new Error('Il formato del file non è valido');
      }
      
      return projectData;
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      return null;
    }
  }
  
  /**
   * Ripristina i dati del progetto nell'applicazione
   */
  static restoreProject(projectData: ProjectData): boolean {
    try {
      // Salva il contenuto dell'editor
      if (projectData.editorContent) {
        localStorage.setItem('editor_content', projectData.editorContent);
      }
      
      // Salva i personaggi
      if (projectData.characters && Array.isArray(projectData.characters)) {
        localStorage.setItem('characters', JSON.stringify(projectData.characters));
      }
      
      // Salva le mappe
      if (projectData.maps && Array.isArray(projectData.maps)) {
        localStorage.setItem('maps', JSON.stringify(projectData.maps));
      }
      
      // Salva le razze
      if (projectData.races && Array.isArray(projectData.races)) {
        localStorage.setItem('races', JSON.stringify(projectData.races));
      }
      
      // Salva gli eventi
      if (projectData.events && Array.isArray(projectData.events)) {
        localStorage.setItem('events', JSON.stringify(projectData.events));
      }
      
      // Ripristina altre impostazioni
      if (projectData.settings) {
        for (const [key, value] of Object.entries(projectData.settings)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Errore durante il ripristino del progetto:', error);
      return false;
    }
  }
  
  /**
   * Esporta il file del progetto scaricandolo
   */
  static downloadProject(projectData: ProjectData): void {
    const jsonString = this.createExportFile(projectData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Crea un link temporaneo e simula il click
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.metadata.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`;
    document.body.appendChild(a);
    a.click();
    
    // Pulizia
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}