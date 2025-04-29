import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import UserProfile from "@/components/gamification/UserProfile";
import Achievements from "@/components/gamification/Achievements";
import { useEditor } from "@/hooks/use-editor";
import { useGamification } from "@/hooks/use-gamification";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [, navigate] = useLocation();
  const { restoreTemporaryContent } = useEditor();
  const { level, stats } = useGamification();

  // Get theme preference from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("markdown-editor-theme");
    setIsDarkTheme(savedTheme === "dark");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
      
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => {
                restoreTemporaryContent();
                navigate('/');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Editor
            </Button>
            <h1 className="text-2xl font-semibold">Writer Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{level}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Words Written</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.wordCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.writeStreak} days</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="pt-6">
                <UserProfile />
              </TabsContent>
              
              <TabsContent value="achievements" className="pt-6">
                <Achievements />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer wordCount={0} charCount={0} />
    </div>
  );
}