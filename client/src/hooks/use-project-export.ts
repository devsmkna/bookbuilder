import { useState, useCallback } from 'react';

/**
 * Hook per gestire lo stato della UI di esportazione/importazione del progetto
 */
export function useProjectExport() {
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  
  // Funzione per aprire il modal di esportazione/importazione
  const openExportImport = useCallback(() => {
    setIsExportImportOpen(true);
  }, []);
  
  // Funzione per chiudere il modal di esportazione/importazione
  const closeExportImport = useCallback(() => {
    setIsExportImportOpen(false);
  }, []);
  
  return {
    isExportImportOpen,
    openExportImport,
    closeExportImport
  };
}