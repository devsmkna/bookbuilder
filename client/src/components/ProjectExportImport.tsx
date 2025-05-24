import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Globe, Code, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  exportToHTML,
  exportToPDF,
  exportToTXT,
  downloadHTML,
  generateFilename,
  getTextStatistics,
  type ExportOptions,
  type ExportMetadata
} from '@/lib/export-service';

interface ProjectExportImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectExportImport({ isOpen, onClose }: ProjectExportImportProps) {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'pdf' | 'html' | 'txt'>('html');
  const [title, setTitle] = useState('Il Mio Racconto');
  const [author, setAuthor] = useState('Autore');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Recupera il contenuto dell'editor dal localStorage o da altri stati globali
  const getEditorContent = (): string => {
    return localStorage.getItem('editor-content') || '';
  };

  // Recupera il contenuto HTML renderizzato dall'anteprima
  const getRenderedContent = (): string => {
    return localStorage.getItem('editor-rendered-content') || '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const content = getEditorContent();
      
      if (!content.trim()) {
        toast({
          title: "Contenuto vuoto",
          description: "Non c'è contenuto da esportare nell'editor.",
          variant: "destructive"
        });
        setIsExporting(false);
        return;
      }

      const stats = getTextStatistics(content);
      const filename = generateFilename(title, exportFormat);
      
      const metadata: ExportMetadata = {
        title,
        author,
        wordCount: stats.wordCount,
        charCount: stats.charCount,
        exportDate: new Date().toISOString(),
        projectName: 'BookBuilder Project'
      };

      const options: ExportOptions = {
        title,
        author,
        includeMetadata,
        includeStats,
        format: exportFormat
      };

      // Usa il contenuto renderizzato se disponibile, altrimenti usa il Markdown
      const renderedContent = getRenderedContent();
      const contentToExport = renderedContent || content;

      switch (exportFormat) {
        case 'html':
          const htmlContent = exportToHTML(contentToExport, metadata, options, !!renderedContent);
          downloadHTML(htmlContent, filename);
          break;
          
        case 'pdf':
          const pdfHtmlContent = exportToHTML(contentToExport, metadata, options, !!renderedContent);
          exportToPDF(pdfHtmlContent, filename);
          break;
          
        case 'txt':
          exportToTXT(content, filename);
          break;
      }

      toast({
        title: "Esportazione completata",
        description: `Il documento è stato esportato come ${exportFormat.toUpperCase()}.`,
      });

      onClose();
      
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      toast({
        title: "Errore nell'esportazione",
        description: "Si è verificato un errore durante l'esportazione del documento.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    html: <Globe className="w-4 h-4" />,
    pdf: <Printer className="w-4 h-4" />,
    txt: <FileText className="w-4 h-4" />
  };

  const formatDescriptions = {
    html: 'Formato web con stili e formattazione completa',
    pdf: 'Genera PDF tramite stampa del browser (Ctrl+P)',
    txt: 'Testo semplice senza formattazione'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Esporta Progetto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informazioni documento */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo del documento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Inserisci il titolo..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Autore</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Inserisci il nome dell'autore..."
              />
            </div>
          </div>

          <Separator />

          {/* Formato di esportazione */}
          <div className="space-y-3">
            <Label>Formato di esportazione</Label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'html' | 'txt') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">
                  <div className="flex items-center gap-2">
                    {formatIcons.html}
                    <span>HTML</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    {formatIcons.pdf}
                    <span>PDF</span>
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    {formatIcons.txt}
                    <span>TXT</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <p className="text-sm text-muted-foreground">
              {formatDescriptions[exportFormat]}
            </p>
          </div>

          <Separator />

          {/* Opzioni di esportazione */}
          <div className="space-y-3">
            <Label>Opzioni di esportazione</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="metadata" className="text-sm font-normal">
                Includi metadati documento
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stats"
                checked={includeStats}
                onCheckedChange={(checked) => setIncludeStats(checked as boolean)}
              />
              <Label htmlFor="stats" className="text-sm font-normal">
                Includi statistiche di scrittura
              </Label>
            </div>
          </div>

          {/* Anteprima statistiche */}
          {(() => {
            const content = getEditorContent();
            const stats = getTextStatistics(content);
            return (
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Anteprima documento</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Parole:</span>
                    <div className="font-medium">{stats.wordCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Caratteri:</span>
                    <div className="font-medium">{stats.charCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Paragrafi:</span>
                    <div className="font-medium">{stats.paragraphs}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Pulsanti azione */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || !getEditorContent().trim()}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Esportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Esporta {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}