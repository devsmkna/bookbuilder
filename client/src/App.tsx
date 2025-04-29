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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="book-builder-theme">
        <GamificationProvider>
          <Router />
          <Toaster />
        </GamificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
