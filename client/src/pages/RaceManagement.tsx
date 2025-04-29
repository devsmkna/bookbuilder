import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, 
  Plus, 
  ArrowLeft, 
  Save, 
  Trash2, 
  FileImage,
  History 
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/hooks/use-editor";

// Race interface
interface Race {
  id: string;
  name: string;
  lore: string;
  traits: string;
  society: string;
  habitat: string;
  imageData: string; // Base64 encoded image
  createdAt: Date;
  lastModified: Date;
  history: RaceVersion[];
}

// History/version interface
interface RaceVersion {
  id: string;
  timestamp: Date;
  changes: string;
  data: Omit<Race, 'history'>;
}

// Default race template
const defaultRace: Omit<Race, 'id' | 'createdAt' | 'lastModified' | 'history'> = {
  name: "",
  lore: "",
  traits: "",
  society: "",
  habitat: "",
  imageData: "",
};

export default function RaceManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [races, setRaces] = useState<Race[]>([]);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<RaceVersion | null>(null);
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { restoreTemporaryContent } = useEditor();

  // Load races from localStorage on mount
  useEffect(() => {
    const savedRaces = localStorage.getItem('book-builder-races');
    if (savedRaces) {
      try {
        const parsed = JSON.parse(savedRaces);
        setRaces(parsed);
      } catch (e) {
        console.error('Failed to parse saved races:', e);
      }
    }
  }, []);

  // Save races to localStorage when updated
  useEffect(() => {
    if (races.length > 0) {
      localStorage.setItem('book-builder-races', JSON.stringify(races));
    }
  }, [races]);

  const createNewRace = () => {
    const newRace: Race = {
      ...defaultRace,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastModified: new Date(),
      history: []
    };
    
    setEditingRace(newRace);
    setIsCreatingNew(true);
    setActiveTab("info");
  };

  const saveRace = () => {
    if (!editingRace) return;
    
    // Create new version based on current state
    const newVersion: RaceVersion = {
      id: Date.now().toString(),
      timestamp: new Date(),
      changes: isCreatingNew ? "Initial creation" : "Updated race information",
      data: {
        id: editingRace.id,
        name: editingRace.name,
        lore: editingRace.lore,
        traits: editingRace.traits,
        society: editingRace.society,
        habitat: editingRace.habitat,
        imageData: editingRace.imageData,
        createdAt: editingRace.createdAt,
        lastModified: new Date()
      }
    };
    
    const updatedRace = {
      ...editingRace,
      lastModified: new Date(),
      history: [newVersion, ...(editingRace.history || [])]
    };
    
    if (isCreatingNew) {
      setRaces([...races, updatedRace]);
      toast({
        title: "Race Created",
        description: `${updatedRace.name || "New race"} has been created successfully.`
      });
    } else {
      setRaces(races.map(race => 
        race.id === updatedRace.id ? updatedRace : race
      ));
      toast({
        title: "Race Updated",
        description: `${updatedRace.name} has been updated successfully.`
      });
    }
    
    setIsCreatingNew(false);
    setEditingRace(null);
  };

  const deleteRace = (id: string) => {
    setRaces(races.filter(race => race.id !== id));
    
    if (editingRace && editingRace.id === id) {
      setEditingRace(null);
    }
    
    toast({
      title: "Race Deleted",
      description: "The race has been deleted successfully."
    });
  };

  const handleInputChange = (field: string, value: string) => {
    if (!editingRace) return;
    
    setEditingRace({
      ...editingRace,
      [field]: value
    });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!editingRace) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setEditingRace({
        ...editingRace,
        imageData: reader.result as string
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const restoreVersion = (version: RaceVersion) => {
    if (!editingRace) return;
    
    // Create new version showing we're restoring from a previous one
    const restoredVersion: RaceVersion = {
      id: Date.now().toString(),
      timestamp: new Date(),
      changes: `Restored from version created on ${version.timestamp.toString()}`,
      data: version.data
    };
    
    const updatedRace = {
      ...editingRace,
      name: version.data.name,
      lore: version.data.lore,
      traits: version.data.traits,
      society: version.data.society,
      habitat: version.data.habitat,
      imageData: version.data.imageData,
      lastModified: new Date(),
      history: [restoredVersion, ...editingRace.history]
    };
    
    setEditingRace(updatedRace);
    setViewingVersion(null);
    
    toast({
      title: "Version Restored",
      description: "The race has been restored to a previous version."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <Header
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
      
      <main className="flex-1 overflow-auto">
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
            <h1 className="text-2xl font-semibold">Race Management</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Race List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Races</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={createNewRace}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {races.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No races yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={createNewRace}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Create Race
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {races.map(race => (
                        <div 
                          key={race.id}
                          className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                            editingRace && editingRace.id === race.id 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            setEditingRace(race);
                            setIsCreatingNew(false);
                            setActiveTab("info");
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              {race.imageData ? (
                                <img 
                                  src={race.imageData} 
                                  alt={race.name || "Race image"} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserPlus className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{race.name || "Unnamed Race"}</div>
                              <div className="text-xs text-muted-foreground">
                                Last modified: {new Date(race.lastModified).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRace(race.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Race Editor */}
            <div className="lg:col-span-9">
              {!editingRace ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <UserPlus className="h-20 w-20 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2">No Race Selected</h3>
                    <p className="text-muted-foreground mb-6">
                      Select a race from the list or create a new one
                    </p>
                    <Button onClick={createNewRace}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create Race
                    </Button>
                  </CardContent>
                </Card>
              ) : viewingVersion ? (
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{viewingVersion.data.name || "Unnamed Race"}</h2>
                        <p className="text-sm text-muted-foreground">
                          Version from: {new Date(viewingVersion.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm mt-1">
                          Changes: {viewingVersion.changes}
                        </p>
                      </div>
                      <Button 
                        variant="default" 
                        onClick={() => restoreVersion(viewingVersion)}
                      >
                        Restore This Version
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Race Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {viewingVersion.data.imageData && (
                          <div className="md:col-span-1">
                            <div className="border rounded-md overflow-hidden">
                              <img 
                                src={viewingVersion.data.imageData} 
                                alt={viewingVersion.data.name} 
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className={viewingVersion.data.imageData ? "md:col-span-2" : "md:col-span-3"}>
                          <h3 className="font-medium mb-2">Lore</h3>
                          <p className="mb-4 whitespace-pre-wrap">{viewingVersion.data.lore || "No lore available"}</p>
                          
                          <h3 className="font-medium mb-2">Traits</h3>
                          <p className="mb-4 whitespace-pre-wrap">{viewingVersion.data.traits || "No traits available"}</p>
                          
                          <h3 className="font-medium mb-2">Society</h3>
                          <p className="mb-4 whitespace-pre-wrap">{viewingVersion.data.society || "No society details available"}</p>
                          
                          <h3 className="font-medium mb-2">Habitat</h3>
                          <p className="whitespace-pre-wrap">{viewingVersion.data.habitat || "No habitat details available"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setViewingVersion(null)}
                    >
                      Back to Editing
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <Input
                          className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                          placeholder="Race Name"
                          value={editingRace.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          Created: {new Date(editingRace.createdAt).toLocaleDateString()} | Last modified: {new Date(editingRace.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="default" 
                        onClick={saveRace}
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        Save Race
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="flex border-b mb-6">
                      <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "info" ? "border-b-2 border-primary" : "text-muted-foreground"}`}
                        onClick={() => setActiveTab("info")}
                      >
                        Information
                      </button>
                      <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "history" ? "border-b-2 border-primary" : "text-muted-foreground"}`}
                        onClick={() => setActiveTab("history")}
                      >
                        Version History
                      </button>
                    </div>
                    
                    {activeTab === "info" ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1">
                            <Label htmlFor="raceImage" className="block mb-2">Race Image</Label>
                            <div className="border rounded-md p-2 flex items-center justify-center bg-muted/30 relative">
                              {editingRace.imageData ? (
                                <img
                                  src={editingRace.imageData}
                                  alt={editingRace.name || "Race image"}
                                  className="max-h-[200px] max-w-full object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
                                  <FileImage className="h-10 w-10 mb-2 opacity-20" />
                                  <p className="text-sm">No image uploaded</p>
                                </div>
                              )}
                            </div>
                            <Input
                              id="raceImage"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="mt-4"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="raceLore" className="block mb-2">Lore</Label>
                                <Textarea
                                  id="raceLore"
                                  placeholder="Describe the race's history, origins, and background..."
                                  className="h-32"
                                  value={editingRace.lore}
                                  onChange={(e) => handleInputChange('lore', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <Label htmlFor="raceTraits" className="block mb-2">Traits</Label>
                            <Textarea
                              id="raceTraits"
                              placeholder="Physical and mental characteristics..."
                              className="h-40"
                              value={editingRace.traits}
                              onChange={(e) => handleInputChange('traits', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="raceSociety" className="block mb-2">Society</Label>
                            <Textarea
                              id="raceSociety"
                              placeholder="Social structure, culture, and customs..."
                              className="h-40"
                              value={editingRace.society}
                              onChange={(e) => handleInputChange('society', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="raceHabitat" className="block mb-2">Habitat</Label>
                            <Textarea
                              id="raceHabitat"
                              placeholder="Where they live and their environments..."
                              className="h-40"
                              value={editingRace.habitat}
                              onChange={(e) => handleInputChange('habitat', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Version History</h3>
                          <div className="text-sm text-muted-foreground">
                            {editingRace.history.length} version{editingRace.history.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        {editingRace.history.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>No version history yet</p>
                            <p className="text-sm mt-1">Save changes to create a new version</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {editingRace.history.map((version) => (
                              <div 
                                key={version.id}
                                className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 cursor-pointer"
                                onClick={() => setViewingVersion(version)}
                              >
                                <div>
                                  <div className="font-medium">
                                    {new Date(version.timestamp).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {version.changes}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreVersion(version);
                                  }}
                                >
                                  Restore
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingRace(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={saveRace}
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      Save Race
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer wordCount={0} charCount={0} />
    </div>
  );
}