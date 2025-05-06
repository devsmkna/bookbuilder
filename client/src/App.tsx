import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CharacterCreation from "@/pages/CharacterCreation";
import WorldBuilding from "@/pages/WorldBuilding";
import Dashboard from "@/pages/Dashboard";
import RaceManagement from "@/pages/RaceManagement";
import StoryboardPlanner from "@/pages/StoryboardPlanner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { GamificationProvider } from "@/context/GamificationContext";
import GlobalSearch from "@/components/GlobalSearch";
import { useGlobalSearch } from "@/hooks/use-global-search";
import ProjectExportImport from "@/components/ProjectExportImport";
import { useProjectExport } from "@/hooks/use-project-export";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/character-creation" component={CharacterCreation} />
      <Route path="/world-building" component={WorldBuilding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/race-management" component={RaceManagement} />
      <Route path="/storyboard-planner" component={StoryboardPlanner} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Utilizziamo il hook per la ricerca globale
  const { isOpen, closeSearch, handleNavigateToResult } = useGlobalSearch();
  
  // Utilizziamo il hook per l'esportazione/importazione del progetto
  const { isExportImportOpen, openExportImport, closeExportImport } = useProjectExport();
  
  // Registra un event listener per aprire la finestra di esportazione/importazione
  useEffect(() => {
    const handleOpenExportImport = () => {
      openExportImport();
    };
    
    window.addEventListener('open-export-import', handleOpenExportImport);
    
    return () => {
      window.removeEventListener('open-export-import', handleOpenExportImport);
    };
  }, [openExportImport]);
  
  return (
    <>
      <Router />
      <Toaster />
      <GlobalSearch 
        isOpen={isOpen} 
        onClose={closeSearch} 
        onNavigate={handleNavigateToResult} 
      />
      <ProjectExportImport
        isOpen={isExportImportOpen}
        onClose={closeExportImport}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="book-builder-theme">
        <GamificationProvider>
          <AppContent />
        </GamificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
