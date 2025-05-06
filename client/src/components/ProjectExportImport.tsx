import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, FileText, AlertTriangle, Check } from "lucide-react";
import { ProjectExportService, ProjectData } from "@/lib/project-export-service";

interface ProjectExportImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectExportImport: React.FC<ProjectExportImportProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("export");
  const [projectName, setProjectName] = useState<string>("Il mio progetto");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [importedProject, setImportedProject] = useState<ProjectData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Gestisce l'esportazione del progetto
  const handleExportProject = () => {
    try {
      setIsExporting(true);
      
      // Esporta i dati del progetto
      const projectData = ProjectExportService.exportProject(
        projectName,
        projectDescription
      );
      
      // Scarica il file
      ProjectExportService.downloadProject(projectData);
      
      // Mostra feedback di successo
      toast({
        title: "Esportazione completata",
        description: "Il progetto è stato esportato con successo.",
        duration: 5000,
      });
      
      // Chiudi il modal dopo un breve ritardo
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      // Mostra feedback di errore
      toast({
        title: "Errore durante l'esportazione",
        description: "Si è verificato un errore durante l'esportazione del progetto.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Errore di esportazione:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Gestisce la selezione del file per l'importazione
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    setImportedProject(null);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const projectData = ProjectExportService.importProject(fileContent);
        
        if (!projectData) {
          setImportError("Il file non contiene dati validi del progetto.");
          return;
        }
        
        // Memorizza il progetto importato
        setImportedProject(projectData);
        
      } catch (error) {
        console.error("Errore durante la lettura del file:", error);
        setImportError("Si è verificato un errore durante la lettura del file.");
      }
    };
    
    reader.onerror = () => {
      setImportError("Si è verificato un errore durante la lettura del file.");
    };
    
    reader.readAsText(file);
  };
  
  // Gestisce l'importazione del progetto
  const handleImportProject = () => {
    if (!importedProject) return;
    
    try {
      setIsImporting(true);
      
      // Importa i dati nel sistema
      const success = ProjectExportService.restoreProject(importedProject);
      
      if (!success) {
        setImportError("Si è verificato un errore durante l'importazione del progetto.");
        return;
      }
      
      // Mostra conferma di successo
      setImportSuccess(true);
      setImportError(null);
      
      // Mostra toast
      toast({
        title: "Importazione completata",
        description: "Il progetto è stato importato con successo. Ricarica la pagina per vedere i cambiamenti.",
        duration: 7000,
      });
      
      // Chiudi il modal dopo un breve ritardo
      setTimeout(() => {
        onClose();
        // Ricarica la pagina per riflettere i cambiamenti
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Errore durante l'importazione:", error);
      setImportError("Si è verificato un errore durante l'importazione del progetto.");
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Gestione Progetto</DialogTitle>
          <DialogDescription>
            Esporta o importa tutti i dati del tuo progetto in un file JSON.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Esporta Progetto</TabsTrigger>
            <TabsTrigger value="import">Importa Progetto</TabsTrigger>
          </TabsList>
          
          {/* Tab per l'esportazione */}
          <TabsContent value="export" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nome del progetto</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Inserisci un nome per il progetto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description">Descrizione (opzionale)</Label>
                <Input
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Inserisci una breve descrizione"
                />
              </div>
              
              <Alert className="bg-muted/50">
                <FileText className="h-5 w-5" />
                <AlertTitle>Cosa verrà esportato</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                    <li>Tutti i contenuti dell'editor</li>
                    <li>Tutti i personaggi creati</li>
                    <li>Tutte le mappe e i luoghi</li>
                    <li>Tutte le razze</li>
                    <li>Tutti gli eventi</li>
                    <li>Impostazioni personali del progetto</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button 
                onClick={handleExportProject} 
                disabled={isExporting || !projectName.trim()}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Esportazione in corso..." : "Esporta Progetto"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          {/* Tab per l'importazione */}
          <TabsContent value="import" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">Seleziona un file di progetto</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileSelection}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                  >
                    Sfoglia
                  </Button>
                </div>
              </div>
              
              {importedProject && (
                <Alert className="bg-muted/50">
                  <FileText className="h-5 w-5" />
                  <AlertTitle>Progetto rilevato</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 text-sm space-y-1">
                      <p><strong>Nome:</strong> {importedProject.metadata.name}</p>
                      {importedProject.metadata.description && (
                        <p><strong>Descrizione:</strong> {importedProject.metadata.description}</p>
                      )}
                      <p><strong>Creato il:</strong> {new Date(importedProject.metadata.createdAt).toLocaleString()}</p>
                      <p><strong>Esportato il:</strong> {new Date(importedProject.metadata.exportedAt).toLocaleString()}</p>
                      <p className="mt-2 font-medium">Il progetto contiene:</p>
                      <ul className="list-disc pl-5">
                        <li>{importedProject.characters?.length || 0} personaggi</li>
                        <li>{importedProject.maps?.length || 0} mappe</li>
                        <li>{importedProject.places?.length || 0} luoghi</li>
                        <li>{importedProject.races?.length || 0} razze</li>
                        <li>{importedProject.events?.length || 0} eventi</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {importError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>Errore</AlertTitle>
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
              
              {importSuccess && (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-5 w-5 text-green-600" />
                  <AlertTitle>Importazione completata</AlertTitle>
                  <AlertDescription>
                    Il progetto è stato importato con successo. La pagina verrà ricaricata automaticamente.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <AlertTitle>Attenzione</AlertTitle>
                <AlertDescription>
                  L'importazione sovrascriverà tutti i dati esistenti del progetto corrente. 
                  Assicurati di esportare i tuoi dati attuali prima di procedere.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button 
                onClick={handleImportProject} 
                disabled={isImporting || !importedProject || importSuccess}
                className="gap-2"
                variant={importedProject ? "default" : "outline"}
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Importazione in corso..." : "Importa Progetto"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectExportImport;