import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Plus, ArrowLeft, Save, Trash2, ChevronRight, FileImage } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/hooks/use-editor";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Character interface with the requested fields
interface Character {
  id: string;
  // Basic Info
  name: string;
  pronunciation: string;
  aliases: string;
  age: string;
  race: string;
  eyeColor: string;
  secondEyeColor: string; // For heterochromic eyes
  hasHeterochromia: boolean; // Flag for heterochromic eyes
  hairColor: string;
  skinColor: string;
  height: string;
  bodyType: string;
  
  // Behavior
  attitude: string;
  bodyLanguage: string;
  bodySigns: string;
  
  // Personal
  parentalRelationship: string;
  parentalTeachings: string;
  respect: string;
  hates: string;
  fears: string;
  contradictions: string;
  dreams: string;
  sacrificeForDreams: string;
  values: string; // New field for character values
  antiValues: string; // New field for character anti-values
  
  // Evolution
  motivationEvolution: string;
  emotionalEvolution: string;
  relationshipEvolution: string;
  dreamEvolution: string;
  
  // Creation date
  createdAt: Date;
}

// Default character template
const defaultCharacter: Omit<Character, 'id' | 'createdAt'> = {
  name: "",
  pronunciation: "",
  aliases: "",
  age: "",
  race: "",
  eyeColor: "#6b8e23", // Default olive green
  secondEyeColor: "#4169e1", // Default royal blue
  hasHeterochromia: false,
  hairColor: "#8b4513", // Default brown
  skinColor: "#f5deb3", // Default wheat/tan
  height: "",
  bodyType: "",
  
  attitude: "",
  bodyLanguage: "",
  bodySigns: "",
  
  parentalRelationship: "",
  parentalTeachings: "",
  respect: "",
  hates: "",
  fears: "",
  contradictions: "",
  dreams: "",
  sacrificeForDreams: "",
  values: "",
  antiValues: "",
  
  motivationEvolution: "",
  emotionalEvolution: "",
  relationshipEvolution: "",
  dreamEvolution: ""
};

// Interface for Race
interface Race {
  id: string;
  name: string;
  lore: string;
  imageData: string; // Base64 encoded image
  createdAt: Date;
}

export default function CharacterCreation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [showRaceCreator, setShowRaceCreator] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { restoreTemporaryContent } = useEditor();

  // Load characters from localStorage on mount
  useEffect(() => {
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      try {
        const parsed = JSON.parse(savedCharacters);
        setCharacters(parsed);
      } catch (e) {
        console.error('Failed to parse saved characters:', e);
      }
    }
    
    // Get theme preference
    const savedTheme = localStorage.getItem("markdown-editor-theme");
    setIsDarkTheme(savedTheme === "dark");
  }, []);

  // Save characters to localStorage when updated
  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem('characters', JSON.stringify(characters));
    }
  }, [characters]);

  const createNewCharacter = () => {
    const newCharacter: Character = {
      ...defaultCharacter,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setEditingCharacter(newCharacter);
    setIsCreatingNew(true);
    setActiveTab("basic");
  };

  const saveCharacter = () => {
    if (!editingCharacter) return;
    
    if (isCreatingNew) {
      setCharacters([...characters, editingCharacter]);
      toast({
        title: "Character Created",
        description: `${editingCharacter.name || "New character"} has been created successfully.`
      });
    } else {
      setCharacters(characters.map(char => 
        char.id === editingCharacter.id ? editingCharacter : char
      ));
      toast({
        title: "Character Updated",
        description: `${editingCharacter.name} has been updated successfully.`
      });
    }
    
    setIsCreatingNew(false);
    setEditingCharacter(null);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
    
    if (editingCharacter && editingCharacter.id === id) {
      setEditingCharacter(null);
    }
    
    toast({
      title: "Character Deleted",
      description: "The character has been deleted successfully."
    });
  };

  // Load races from localStorage on mount
  useEffect(() => {
    const savedRaces = localStorage.getItem('races');
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
      localStorage.setItem('races', JSON.stringify(races));
    }
  }, [races]);
  
  // Calculate character completion percentage
  useEffect(() => {
    if (!editingCharacter) return;
    
    // Count total fields and filled fields
    const totalFields = 25; // Update this number if you add/remove fields
    let filledFields = 0;
    
    // Basic Info
    if (editingCharacter.name) filledFields++;
    if (editingCharacter.pronunciation) filledFields++;
    if (editingCharacter.aliases) filledFields++;
    if (editingCharacter.age) filledFields++;
    if (editingCharacter.race) filledFields++;
    if (editingCharacter.height) filledFields++;
    if (editingCharacter.bodyType) filledFields++;
    
    // Colors (these are always filled with default values)
    filledFields += 2; // eyeColor and hairColor
    if (editingCharacter.hasHeterochromia) filledFields++; // secondEyeColor
    
    // Behavior
    if (editingCharacter.attitude) filledFields++;
    if (editingCharacter.bodyLanguage) filledFields++;
    if (editingCharacter.bodySigns) filledFields++;
    
    // Personal
    if (editingCharacter.parentalRelationship) filledFields++;
    if (editingCharacter.parentalTeachings) filledFields++;
    if (editingCharacter.respect) filledFields++;
    if (editingCharacter.hates) filledFields++;
    if (editingCharacter.fears) filledFields++;
    if (editingCharacter.contradictions) filledFields++;
    if (editingCharacter.dreams) filledFields++;
    if (editingCharacter.sacrificeForDreams) filledFields++;
    if (editingCharacter.values) filledFields++;
    if (editingCharacter.antiValues) filledFields++;
    
    // Evolution
    if (editingCharacter.motivationEvolution) filledFields++;
    if (editingCharacter.emotionalEvolution) filledFields++;
    if (editingCharacter.relationshipEvolution) filledFields++;
    if (editingCharacter.dreamEvolution) filledFields++;
    
    // Calculate percentage
    const percentage = Math.round((filledFields / totalFields) * 100);
    setCompletionPercentage(percentage);
  }, [editingCharacter]);

  const handleInputChange = (field: string, value: string) => {
    if (!editingCharacter) return;
    
    setEditingCharacter({
      ...editingCharacter,
      [field]: value
    });
  };
  
  const handleBooleanToggle = (field: string, value: boolean) => {
    if (!editingCharacter) return;
    
    setEditingCharacter({
      ...editingCharacter,
      [field]: value
    });
  };
  
  const createNewRace = () => {
    const newRace: Race = {
      id: Date.now().toString(),
      name: "",
      lore: "",
      imageData: "",
      createdAt: new Date()
    };
    
    setEditingRace(newRace);
    setShowRaceCreator(true);
  };
  
  const saveRace = () => {
    if (!editingRace) return;
    
    if (editingRace.id && races.some(r => r.id === editingRace.id)) {
      // Update existing race
      setRaces(races.map(r => r.id === editingRace.id ? editingRace : r));
    } else {
      // Add new race
      setRaces([...races, editingRace]);
    }
    
    toast({
      title: "Race Saved",
      description: `${editingRace.name} has been saved successfully.`
    });
    
    setEditingRace(null);
    setShowRaceCreator(false);
  };
  
  const deleteRace = (id: string) => {
    setRaces(races.filter(r => r.id !== id));
    
    if (editingRace && editingRace.id === id) {
      setEditingRace(null);
      setShowRaceCreator(false);
    }
    
    toast({
      title: "Race Deleted",
      description: "The race has been deleted successfully."
    });
  };
  
  const handleRaceInputChange = (field: string, value: string) => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <Header
        isFullscreen={false}
        toggleFullscreen={() => {}}
        isDarkTheme={isDarkTheme}
        toggleTheme={() => {
          const newTheme = !isDarkTheme;
          localStorage.setItem("markdown-editor-theme", newTheme ? "dark" : "light");
          setIsDarkTheme(newTheme);
        }}
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
            <h1 className="text-2xl font-semibold">Character Creation</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Character List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Characters</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={createNewCharacter}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {characters.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No characters yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={createNewCharacter}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Create Character
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {characters.map(character => (
                        <div 
                          key={character.id}
                          className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                            editingCharacter && editingCharacter.id === character.id 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            setEditingCharacter(character);
                            setIsCreatingNew(false);
                            setActiveTab("basic");
                          }}
                        >
                          <div>
                            <div className="font-medium">{character.name || "Unnamed Character"}</div>
                            <div className="text-xs text-muted-foreground">
                              {character.aliases && `Also known as: ${character.aliases}`}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCharacter(character.id);
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

            {/* Character Editor */}
            <div className="lg:col-span-9">
              {!editingCharacter ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <UserPlus className="h-20 w-20 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2">No Character Selected</h3>
                    <p className="text-muted-foreground mb-6">
                      Select a character from the list or create a new one
                    </p>
                    <Button onClick={createNewCharacter}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create Character
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <Input
                            className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                            placeholder="Character Name"
                            value={editingCharacter.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                          {editingCharacter.aliases && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Also known as: {editingCharacter.aliases}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="default" 
                          onClick={saveCharacter}
                        >
                          <Save className="h-4 w-4 mr-1.5" />
                          Save Character
                        </Button>
                      </div>
                      
                      {/* Character completion progress */}
                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Character Completion</span>
                          <span>{completionPercentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500 rounded-full" 
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="mb-6 grid grid-cols-4 w-full">
                        <TabsTrigger value="basic" className="rounded-md">Basic Info</TabsTrigger>
                        <TabsTrigger value="behavior" className="rounded-md">Behavior</TabsTrigger>
                        <TabsTrigger value="personal" className="rounded-md">Personal</TabsTrigger>
                        <TabsTrigger value="evolution" className="rounded-md">Evolution</TabsTrigger>
                      </TabsList>
                      
                      {/* Basic Info Tab */}
                      <TabsContent value="basic" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name" className="block mb-2">Name</Label>
                            <Input
                              id="name"
                              placeholder="Character Name"
                              value={editingCharacter.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="pronunciation" className="block mb-2">Name Pronunciation</Label>
                            <Input
                              id="pronunciation"
                              placeholder="How to pronounce the name"
                              value={editingCharacter.pronunciation}
                              onChange={(e) => handleInputChange('pronunciation', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="aliases" className="block mb-2">Aliases</Label>
                            <Input
                              id="aliases"
                              placeholder="Other names or titles"
                              value={editingCharacter.aliases}
                              onChange={(e) => handleInputChange('aliases', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="age" className="block mb-2">Age</Label>
                            <Input
                              id="age"
                              placeholder="Character's age"
                              value={editingCharacter.age}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                            />
                          </div>
                        
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label htmlFor="race" className="block">Race</Label>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={createNewRace}
                              >
                                Create new
                              </Button>
                            </div>
                            <Select 
                              value={editingCharacter.race} 
                              onValueChange={(value) => handleInputChange('race', value)}
                            >
                              <SelectTrigger id="race">
                                <SelectValue placeholder="Select a race" />
                              </SelectTrigger>
                              <SelectContent>
                                {races.length === 0 ? (
                                  <div className="text-center py-4 text-muted-foreground">
                                    <p className="text-sm">No races created yet</p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => {
                                        // Close the select dropdown and open race creator
                                        document.body.click(); // Hack to close the dropdown
                                        setTimeout(createNewRace, 100);
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Create Race
                                    </Button>
                                  </div>
                                ) : (
                                  races.map(race => (
                                    <SelectItem key={race.id} value={race.name}>
                                      {race.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label htmlFor="eyeColor">Eye Color</Label>
                              <div className="flex items-center">
                                <Label htmlFor="hasHeterochromia" className="text-sm mr-2 cursor-pointer">
                                  Heterochromia
                                </Label>
                                <input 
                                  type="checkbox" 
                                  id="hasHeterochromia"
                                  checked={editingCharacter.hasHeterochromia}
                                  onChange={(e) => handleBooleanToggle('hasHeterochromia', e.target.checked)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-full border" 
                                  style={{ backgroundColor: editingCharacter.eyeColor }}
                                />
                                <Input
                                  id="eyeColor"
                                  type="color"
                                  value={editingCharacter.eyeColor}
                                  onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                                  className="w-full"
                                />
                                <span className="text-sm">{editingCharacter.hasHeterochromia ? 'Left' : ''}</span>
                              </div>
                              
                              {editingCharacter.hasHeterochromia && (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-8 h-8 rounded-full border" 
                                    style={{ backgroundColor: editingCharacter.secondEyeColor }}
                                  />
                                  <Input
                                    id="secondEyeColor"
                                    type="color"
                                    value={editingCharacter.secondEyeColor}
                                    onChange={(e) => handleInputChange('secondEyeColor', e.target.value)}
                                    className="w-full"
                                  />
                                  <span className="text-sm">Right</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="hairColor" className="block mb-2">Hair Color</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border" 
                                style={{ backgroundColor: editingCharacter.hairColor }}
                              />
                              <Input
                                id="hairColor"
                                type="color"
                                value={editingCharacter.hairColor}
                                onChange={(e) => handleInputChange('hairColor', e.target.value)}
                                className="w-full"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="skinColor" className="block mb-2">Skin Color</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border" 
                                style={{ backgroundColor: editingCharacter.skinColor }}
                              />
                              <Input
                                id="skinColor"
                                type="color"
                                value={editingCharacter.skinColor}
                                onChange={(e) => handleInputChange('skinColor', e.target.value)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="height" className="block mb-2">Height (cm)</Label>
                            <Input
                              id="height"
                              placeholder="Character's height in cm"
                              value={editingCharacter.height}
                              onChange={(e) => handleInputChange('height', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="bodyType" className="block mb-2">Body Type</Label>
                            <Input
                              id="bodyType"
                              placeholder="Character's build/physique"
                              value={editingCharacter.bodyType}
                              onChange={(e) => handleInputChange('bodyType', e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Behavior Tab */}
                      <TabsContent value="behavior" className="space-y-6">
                        <div>
                          <Label htmlFor="attitude" className="block mb-2">Attitude</Label>
                          <Textarea
                            id="attitude"
                            placeholder="Character's general attitude..."
                            className="h-32"
                            value={editingCharacter.attitude}
                            onChange={(e) => handleInputChange('attitude', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="bodyLanguage" className="block mb-2">Body Language</Label>
                          <Textarea
                            id="bodyLanguage"
                            placeholder="How the character physically expresses themselves..."
                            className="h-32"
                            value={editingCharacter.bodyLanguage}
                            onChange={(e) => handleInputChange('bodyLanguage', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="bodySigns" className="block mb-2">Body Signs</Label>
                          <Textarea
                            id="bodySigns"
                            placeholder="Unique physical mannerisms or signs..."
                            className="h-32"
                            value={editingCharacter.bodySigns}
                            onChange={(e) => handleInputChange('bodySigns', e.target.value)}
                          />
                        </div>
                      </TabsContent>
                      
                      {/* Personal Tab */}
                      <TabsContent value="personal" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="parentalRelationship" className="block mb-2">Parental Figures Relationship</Label>
                            <Textarea
                              id="parentalRelationship"
                              placeholder="Relationship with parents or guardian figures..."
                              className="h-24"
                              value={editingCharacter.parentalRelationship}
                              onChange={(e) => handleInputChange('parentalRelationship', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="parentalTeachings" className="block mb-2">Parental Teachings Attitude</Label>
                            <Textarea
                              id="parentalTeachings"
                              placeholder="How they relate to what they were taught..."
                              className="h-24"
                              value={editingCharacter.parentalTeachings}
                              onChange={(e) => handleInputChange('parentalTeachings', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="respect" className="block mb-2">Respect</Label>
                            <Textarea
                              id="respect"
                              placeholder="What or who they respect..."
                              className="h-24"
                              value={editingCharacter.respect}
                              onChange={(e) => handleInputChange('respect', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="hates" className="block mb-2">Hates</Label>
                            <Textarea
                              id="hates"
                              placeholder="What they hate or strongly dislike..."
                              className="h-24"
                              value={editingCharacter.hates}
                              onChange={(e) => handleInputChange('hates', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="fears" className="block mb-2">Fears</Label>
                            <Textarea
                              id="fears"
                              placeholder="What they fear or are anxious about..."
                              className="h-24"
                              value={editingCharacter.fears}
                              onChange={(e) => handleInputChange('fears', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="contradictions" className="block mb-2">Contradictions</Label>
                            <Textarea
                              id="contradictions"
                              placeholder="Contradictory aspects of their personality..."
                              className="h-24"
                              value={editingCharacter.contradictions}
                              onChange={(e) => handleInputChange('contradictions', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="dreams" className="block mb-2">Dreams</Label>
                            <Textarea
                              id="dreams"
                              placeholder="Their aspirations and dreams..."
                              className="h-24"
                              value={editingCharacter.dreams}
                              onChange={(e) => handleInputChange('dreams', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="sacrificeForDreams" className="block mb-2">Willing to Sacrifice for Dreams</Label>
                            <Textarea
                              id="sacrificeForDreams"
                              placeholder="What they would sacrifice to achieve their dreams..."
                              className="h-24"
                              value={editingCharacter.sacrificeForDreams}
                              onChange={(e) => handleInputChange('sacrificeForDreams', e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Evolution Tab */}
                      <TabsContent value="evolution" className="space-y-6">
                        <div className="bg-card border rounded-lg p-6 mb-6 relative overflow-hidden">
                          {/* Visually inspired by the character sheet design */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-50"></div>
                          
                          <div className="relative z-10 grid grid-cols-1 gap-10">
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-accent">Motivation Evolution</h3>
                              <Textarea
                                placeholder="How their motivations have changed over time..."
                                className="h-32 bg-card/50 border-muted"
                                value={editingCharacter.motivationEvolution}
                                onChange={(e) => handleInputChange('motivationEvolution', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-accent">Emotional Evolution</h3>
                              <Textarea
                                placeholder="How their emotional responses have changed..."
                                className="h-32 bg-card/50 border-muted"
                                value={editingCharacter.emotionalEvolution}
                                onChange={(e) => handleInputChange('emotionalEvolution', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-accent">Relationship Evolution</h3>
                              <Textarea
                                placeholder="How their relationships with others have evolved..."
                                className="h-32 bg-card/50 border-muted"
                                value={editingCharacter.relationshipEvolution}
                                onChange={(e) => handleInputChange('relationshipEvolution', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-accent">Dream Evolution</h3>
                              <Textarea
                                placeholder="How their dreams and aspirations have changed..."
                                className="h-32 bg-card/50 border-muted"
                                value={editingCharacter.dreamEvolution}
                                onChange={(e) => handleInputChange('dreamEvolution', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingCharacter(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={saveCharacter}
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      Save Character
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