import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Plus, ArrowLeft, Save, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/hooks/use-editor";

// Character interface
interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  alignment: string;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  spells: string[];
  equipment: string[];
  background: string;
  appearance: string;
  createdAt: Date;
}

// Default character template
const defaultCharacter: Omit<Character, 'id' | 'createdAt'> = {
  name: "",
  race: "",
  class: "",
  level: 1,
  alignment: "",
  attributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  skills: [],
  spells: [],
  equipment: [],
  background: "",
  appearance: ""
};

export default function CharacterCreation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState("attributes");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
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
    setActiveTab("attributes");
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

  const handleInputChange = (field: string, value: string | number) => {
    if (!editingCharacter) return;
    
    setEditingCharacter({
      ...editingCharacter,
      [field]: value
    });
  };

  const handleAttributeChange = (attribute: string, value: string) => {
    if (!editingCharacter) return;
    
    // Only accept numbers
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    setEditingCharacter({
      ...editingCharacter,
      attributes: {
        ...editingCharacter.attributes,
        [attribute]: numValue
      }
    });
  };

  const handleSkillsChange = (skillsText: string) => {
    if (!editingCharacter) return;
    
    const skillsArray = skillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    
    setEditingCharacter({
      ...editingCharacter,
      skills: skillsArray
    });
  };

  const handleSpellsChange = (spellsText: string) => {
    if (!editingCharacter) return;
    
    const spellsArray = spellsText
      .split(',')
      .map(spell => spell.trim())
      .filter(spell => spell.length > 0);
    
    setEditingCharacter({
      ...editingCharacter,
      spells: spellsArray
    });
  };

  const handleEquipmentChange = (equipmentText: string) => {
    if (!editingCharacter) return;
    
    const equipmentArray = equipmentText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setEditingCharacter({
      ...editingCharacter,
      equipment: equipmentArray
    });
  };

  const calculateModifier = (value: number) => {
    return Math.floor((value - 10) / 2);
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
                            setActiveTab("attributes");
                          }}
                        >
                          <div>
                            <div className="font-medium">{character.name || "Unnamed Character"}</div>
                            <div className="text-xs text-muted-foreground">
                              {character.race} {character.class} (Lvl {character.level})
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
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <Input
                        className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                        placeholder="Character Name"
                        value={editingCharacter.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                      <Button 
                        variant="default" 
                        onClick={saveCharacter}
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        Save Character
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center">
                        <Label className="mr-2 whitespace-nowrap">Race:</Label>
                        <Input
                          className="w-32"
                          placeholder="Race"
                          value={editingCharacter.race}
                          onChange={(e) => handleInputChange('race', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <Label className="mr-2 whitespace-nowrap">Class:</Label>
                        <Input
                          className="w-32"
                          placeholder="Class"
                          value={editingCharacter.class}
                          onChange={(e) => handleInputChange('class', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <Label className="mr-2 whitespace-nowrap">Level:</Label>
                        <Input
                          className="w-20"
                          type="number"
                          min="1"
                          max="20"
                          value={editingCharacter.level}
                          onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="flex items-center">
                        <Label className="mr-2 whitespace-nowrap">Alignment:</Label>
                        <Select
                          value={editingCharacter.alignment}
                          onValueChange={(value) => handleInputChange('alignment', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select alignment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lawful Good">Lawful Good</SelectItem>
                            <SelectItem value="Neutral Good">Neutral Good</SelectItem>
                            <SelectItem value="Chaotic Good">Chaotic Good</SelectItem>
                            <SelectItem value="Lawful Neutral">Lawful Neutral</SelectItem>
                            <SelectItem value="True Neutral">True Neutral</SelectItem>
                            <SelectItem value="Chaotic Neutral">Chaotic Neutral</SelectItem>
                            <SelectItem value="Lawful Evil">Lawful Evil</SelectItem>
                            <SelectItem value="Neutral Evil">Neutral Evil</SelectItem>
                            <SelectItem value="Chaotic Evil">Chaotic Evil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="attributes">Attributes</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="equipment">Equipment</TabsTrigger>
                        <TabsTrigger value="description">Description</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="attributes" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {Object.entries(editingCharacter.attributes).map(([attribute, value]) => (
                            <div key={attribute} className="flex flex-col items-center">
                              <Label className="capitalize mb-1">{attribute}</Label>
                              <div className="relative">
                                <Input
                                  className="w-16 text-center"
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={value}
                                  onChange={(e) => handleAttributeChange(attribute, e.target.value)}
                                />
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-card border border-border rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                  {calculateModifier(value) >= 0 ? '+' : ''}{calculateModifier(value)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-6" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="block mb-2">Health Points</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-muted-foreground block mb-1">Max HP</Label>
                                <Input placeholder="Max HP" />
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground block mb-1">Current HP</Label>
                                <Input placeholder="Current HP" />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="block mb-2">Combat Stats</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-muted-foreground block mb-1">Armor Class</Label>
                                <Input placeholder="AC" />
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground block mb-1">Initiative</Label>
                                <Input placeholder="Initiative" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="skills">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="block mb-2">Skills</Label>
                            <Textarea
                              placeholder="Enter skills separated by commas (e.g. Acrobatics, Stealth, Perception)"
                              className="h-40"
                              value={editingCharacter.skills.join(', ')}
                              onChange={(e) => handleSkillsChange(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Separate each skill with a comma
                            </p>
                          </div>
                          
                          <div>
                            <Label className="block mb-2">Spells</Label>
                            <Textarea
                              placeholder="Enter spells separated by commas (e.g. Fireball, Magic Missile, Cure Wounds)"
                              className="h-40"
                              value={editingCharacter.spells.join(', ')}
                              onChange={(e) => handleSpellsChange(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Separate each spell with a comma
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="equipment">
                        <div>
                          <Label className="block mb-2">Equipment</Label>
                          <Textarea
                            placeholder="Enter equipment separated by commas (e.g. Longsword, Leather Armor, Potion of Healing)"
                            className="h-40"
                            value={editingCharacter.equipment.join(', ')}
                            onChange={(e) => handleEquipmentChange(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Separate each equipment item with a comma
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="description">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="block mb-2">Background</Label>
                            <Textarea
                              placeholder="Character background and story..."
                              className="h-40"
                              value={editingCharacter.background}
                              onChange={(e) => handleInputChange('background', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label className="block mb-2">Appearance</Label>
                            <Textarea
                              placeholder="Character appearance, features, distinguishing marks..."
                              className="h-40"
                              value={editingCharacter.appearance}
                              onChange={(e) => handleInputChange('appearance', e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
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