import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, Plus, ArrowLeft, Save, Trash2, Map, MapPin, 
  Upload, X, Image as ImageIcon
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/hooks/use-editor";

// Interface for characters to reference in places
interface Character {
  id: string;
  name: string;
  aliases?: string;
}

// Interface for map
interface WorldMap {
  id: string;
  name: string;
  description: string;
  imageData: string; // Base64 encoded image
  places: Place[];
  createdAt: Date;
}

// Interface for places within a map
interface Place {
  id: string;
  name: string;
  type: string; // e.g., mountain, building, region
  geographicalPosition: string;
  lore: string;
  vibe: string;
  affiliations: string;
  images: string[]; // Base64 encoded images
  characterIds: string[]; // References to character IDs
  coordinates?: { x: number; y: number }; // Position on the map
  createdAt: Date;
}

// Default map template
const defaultMap: Omit<WorldMap, 'id' | 'createdAt'> = {
  name: "",
  description: "",
  imageData: "",
  places: []
};

// Default place template
const defaultPlace: Omit<Place, 'id' | 'createdAt'> = {
  name: "",
  type: "",
  geographicalPosition: "",
  lore: "",
  vibe: "",
  affiliations: "",
  images: [],
  characterIds: [],
  coordinates: undefined
};

// Place types for dropdown
const placeTypes = [
  "City",
  "Town",
  "Village",
  "Castle",
  "Ruin",
  "Mountain",
  "Forest",
  "Lake",
  "Ocean",
  "Desert",
  "Island",
  "Dungeon",
  "Temple",
  "Landmark",
  "Region",
  "Kingdom",
  "Empire",
  "Other"
];

export default function WorldBuilding() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [maps, setMaps] = useState<WorldMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<WorldMap | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [isCreatingPlace, setIsCreatingPlace] = useState(false);
  const [activeTab, setActiveTab] = useState("maps");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isPinningMode, setIsPinningMode] = useState(false);
  const [selectedPlaceForPinning, setSelectedPlaceForPinning] = useState<Place | null>(null);
  const [showPlaceDialog, setShowPlaceDialog] = useState(false);
  
  // Refs
  const mapImageRef = useRef<HTMLDivElement>(null);
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { restoreTemporaryContent } = useEditor();

  // Load maps, places, and characters from localStorage on mount
  useEffect(() => {
    // Load maps
    const savedMaps = localStorage.getItem('worldMaps');
    if (savedMaps) {
      try {
        const parsed = JSON.parse(savedMaps);
        setMaps(parsed);
      } catch (e) {
        console.error('Failed to parse saved maps:', e);
      }
    }
    
    // Load characters for reference
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

  // Save maps to localStorage when updated
  useEffect(() => {
    if (maps.length > 0) {
      localStorage.setItem('worldMaps', JSON.stringify(maps));
    }
  }, [maps]);

  // Create a new map
  const createNewMap = () => {
    const newMap: WorldMap = {
      ...defaultMap,
      id: Date.now().toString(),
      places: [],
      createdAt: new Date()
    };
    
    setSelectedMap(newMap);
    setIsCreatingMap(true);
    setActiveTab("maps");
  };

  // Save the current map
  const saveMap = () => {
    if (!selectedMap) return;
    
    if (isCreatingMap) {
      setMaps([...maps, selectedMap]);
      toast({
        title: "Map Created",
        description: `${selectedMap.name || "New map"} has been created successfully.`
      });
    } else {
      setMaps(maps.map(map => 
        map.id === selectedMap.id ? selectedMap : map
      ));
      toast({
        title: "Map Updated",
        description: `${selectedMap.name} has been updated successfully.`
      });
    }
    
    setIsCreatingMap(false);
  };

  // Delete a map
  const deleteMap = (id: string) => {
    setMaps(maps.filter(map => map.id !== id));
    
    if (selectedMap && selectedMap.id === id) {
      setSelectedMap(null);
    }
    
    toast({
      title: "Map Deleted",
      description: "The map has been deleted successfully."
    });
  };

  // Create a new place
  const createNewPlace = () => {
    if (!selectedMap) return;
    
    const newPlace: Place = {
      ...defaultPlace,
      id: Date.now().toString(),
      images: [],
      characterIds: [],
      createdAt: new Date()
    };
    
    setEditingPlace(newPlace);
    setIsCreatingPlace(true);
    setShowPlaceDialog(true);
  };

  // Save the current place
  const savePlace = () => {
    if (!selectedMap || !editingPlace) return;
    
    let updatedPlaces;
    
    if (isCreatingPlace) {
      updatedPlaces = [...selectedMap.places, editingPlace];
      toast({
        title: "Place Created",
        description: `${editingPlace.name || "New place"} has been added to the map.`
      });
    } else {
      updatedPlaces = selectedMap.places.map(place => 
        place.id === editingPlace.id ? editingPlace : place
      );
      toast({
        title: "Place Updated",
        description: `${editingPlace.name} has been updated successfully.`
      });
    }
    
    const updatedMap = {
      ...selectedMap,
      places: updatedPlaces
    };
    
    setSelectedMap(updatedMap);
    setMaps(maps.map(map => map.id === selectedMap.id ? updatedMap : map));
    setIsCreatingPlace(false);
    setEditingPlace(null);
    setShowPlaceDialog(false);
    setIsPinningMode(false);
    setSelectedPlaceForPinning(null);
  };

  // Delete a place
  const deletePlaceById = (placeId: string) => {
    if (!selectedMap) return;
    
    const updatedPlaces = selectedMap.places.filter(place => place.id !== placeId);
    const updatedMap = {
      ...selectedMap,
      places: updatedPlaces
    };
    
    setSelectedMap(updatedMap);
    setMaps(maps.map(map => map.id === selectedMap.id ? updatedMap : map));
    
    toast({
      title: "Place Deleted",
      description: "The place has been removed from the map."
    });
  };

  // Handle map image upload
  const handleMapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMap) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedMap({
        ...selectedMap,
        imageData: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle place image upload
  const handlePlaceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlace) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditingPlace({
        ...editingPlace,
        images: [...editingPlace.images, base64String]
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove place image
  const removePlaceImage = (index: number) => {
    if (!editingPlace) return;
    
    const updatedImages = [...editingPlace.images];
    updatedImages.splice(index, 1);
    
    setEditingPlace({
      ...editingPlace,
      images: updatedImages
    });
  };

  // Handle place input changes
  const handlePlaceInputChange = (field: string, value: string | string[]) => {
    if (!editingPlace) return;
    
    setEditingPlace({
      ...editingPlace,
      [field]: value
    });
  };

  // Handle map input changes
  const handleMapInputChange = (field: string, value: string) => {
    if (!selectedMap) return;
    
    setSelectedMap({
      ...selectedMap,
      [field]: value
    });
  };

  // Start pinning a place on the map
  const startPinning = (place: Place) => {
    setIsPinningMode(true);
    setSelectedPlaceForPinning(place);
    setShowPlaceDialog(false);
    
    toast({
      title: "Pinning Mode Activated",
      description: "Click on the map to place a pin for this location."
    });
  };

  // Handle map click for pinning
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinningMode || !selectedPlaceForPinning || !mapImageRef.current || !selectedMap) return;
    
    const rect = mapImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Convert to percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Convert to percentage
    
    const updatedPlace = {
      ...selectedPlaceForPinning,
      coordinates: { x, y }
    };
    
    // Update the place in the selected map
    const updatedPlaces = selectedMap.places.map(place => 
      place.id === updatedPlace.id ? updatedPlace : place
    );
    
    const updatedMap = {
      ...selectedMap,
      places: updatedPlaces
    };
    
    setSelectedMap(updatedMap);
    setMaps(maps.map(map => map.id === selectedMap.id ? updatedMap : map));
    setEditingPlace(updatedPlace);
    setIsPinningMode(false);
    setSelectedPlaceForPinning(null);
    setShowPlaceDialog(true);
    
    toast({
      title: "Pin Placed",
      description: `Location for "${updatedPlace.name}" has been set on the map.`
    });
  };

  // Toggle character selection in place
  const toggleCharacterSelection = (characterId: string) => {
    if (!editingPlace) return;
    
    const isSelected = editingPlace.characterIds.includes(characterId);
    let updatedCharacterIds: string[];
    
    if (isSelected) {
      // Remove character if already selected
      updatedCharacterIds = editingPlace.characterIds.filter(id => id !== characterId);
    } else {
      // Add character if not selected
      updatedCharacterIds = [...editingPlace.characterIds, characterId];
    }
    
    setEditingPlace({
      ...editingPlace,
      characterIds: updatedCharacterIds
    });
  };

  // Get character name by ID
  const getCharacterNameById = (id: string) => {
    const character = characters.find(char => char.id === id);
    return character ? character.name : "Unknown Character";
  };

  // Check if a place has coordinates
  const hasCoordinates = (place: Place) => {
    return place.coordinates && place.coordinates.x !== undefined && place.coordinates.y !== undefined;
  };

  // Edit a place
  const editPlace = (place: Place) => {
    setEditingPlace(place);
    setIsCreatingPlace(false);
    setShowPlaceDialog(true);
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
            <h1 className="text-2xl font-semibold">World Building</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Maps List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Maps</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={createNewMap}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {maps.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Map className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No maps yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={createNewMap}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Create Map
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {maps.map(map => (
                        <div 
                          key={map.id}
                          className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                            selectedMap && selectedMap.id === map.id 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            setSelectedMap(map);
                            setIsCreatingMap(false);
                            setActiveTab("maps");
                          }}
                        >
                          <div>
                            <div className="font-medium">{map.name || "Unnamed Map"}</div>
                            <div className="text-xs text-muted-foreground">
                              {map.places.length} {map.places.length === 1 ? 'place' : 'places'}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMap(map.id);
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

            {/* Map Editor */}
            <div className="lg:col-span-9">
              {!selectedMap ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-20">
                    <Map className="h-20 w-20 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2">No Map Selected</h3>
                    <p className="text-muted-foreground mb-6">
                      Select a map from the list or create a new one
                    </p>
                    <Button onClick={createNewMap}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create Map
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <Input
                          className="text-2xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                          placeholder="Map Name"
                          value={selectedMap.name}
                          onChange={(e) => handleMapInputChange('name', e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="default" 
                        onClick={saveMap}
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        Save Map
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="mb-6 grid grid-cols-2 w-full">
                        <TabsTrigger value="maps" className="rounded-md">Map Details</TabsTrigger>
                        <TabsTrigger value="places" className="rounded-md">Places</TabsTrigger>
                      </TabsList>
                      
                      {/* Map Details Tab */}
                      <TabsContent value="maps" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <Label htmlFor="description" className="block mb-2">Map Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Describe your map..."
                              className="h-24"
                              value={selectedMap.description}
                              onChange={(e) => handleMapInputChange('description', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="mapImage" className="block mb-2">Map Image</Label>
                            {!selectedMap.imageData ? (
                              <div className="border-2 border-dashed border-border rounded-md p-12 text-center">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-4">
                                  Upload a map image
                                </p>
                                <Input
                                  id="mapImage"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleMapImageUpload}
                                />
                                <label htmlFor="mapImage">
                                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                    <span>
                                      <Upload className="h-4 w-4 mr-1.5" />
                                      Upload Image
                                    </span>
                                  </Button>
                                </label>
                              </div>
                            ) : (
                              <div className="relative border rounded-md overflow-hidden">
                                <div 
                                  className="relative w-full"
                                  style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
                                >
                                  <img 
                                    src={selectedMap.imageData} 
                                    alt={selectedMap.name || "Map"} 
                                    className="absolute inset-0 w-full h-full object-contain"
                                  />
                                </div>
                                <div className="absolute top-2 right-2 flex space-x-2">
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.onchange = (e) => {
                                        if (e.target instanceof HTMLInputElement && e.target.files) {
                                          const event = {
                                            target: {
                                              files: e.target.files
                                            }
                                          } as React.ChangeEvent<HTMLInputElement>;
                                          handleMapImageUpload(event);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                                    onClick={() => handleMapInputChange('imageData', '')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                      
                      {/* Places Tab */}
                      <TabsContent value="places" className="space-y-6">
                        {!selectedMap.imageData ? (
                          <div className="text-center py-12 border border-dashed rounded-md">
                            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <h3 className="text-lg font-medium mb-2">No Map Image Available</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              Upload a map image in the Map Details tab before adding places to your world.
                            </p>
                            <Button 
                              variant="outline"
                              onClick={() => setActiveTab("maps")}
                            >
                              Go to Map Details
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">Places</h3>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={createNewPlace}
                              >
                                <Plus className="h-4 w-4 mr-1.5" />
                                Add Place
                              </Button>
                            </div>
                            
                            {/* Map with pins */}
                            <div 
                              ref={mapImageRef}
                              className={`relative border rounded-md overflow-hidden ${isPinningMode ? 'cursor-crosshair' : ''}`}
                              onClick={handleMapClick}
                            >
                              <div 
                                className="relative w-full"
                                style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
                              >
                                <img 
                                  src={selectedMap.imageData} 
                                  alt={selectedMap.name || "Map"} 
                                  className="absolute inset-0 w-full h-full object-contain"
                                />
                                
                                {/* Place pins */}
                                {selectedMap.places.filter(hasCoordinates).map(place => (
                                  <div
                                    key={place.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                    style={{ 
                                      left: `${place.coordinates?.x}%`, 
                                      top: `${place.coordinates?.y}%`,
                                      zIndex: 10
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editPlace(place);
                                    }}
                                  >
                                    <MapPin className="h-6 w-6 text-accent drop-shadow-lg" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-card text-card-foreground text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                      {place.name}
                                    </div>
                                  </div>
                                ))}
                                
                                {isPinningMode && (
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="bg-card p-4 rounded-md shadow-lg max-w-sm text-center">
                                      <p className="mb-4">Click anywhere on the map to place a pin for "{selectedPlaceForPinning?.name || 'this location'}"</p>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsPinningMode(false);
                                          setSelectedPlaceForPinning(null);
                                          setShowPlaceDialog(true);
                                        }}
                                      >
                                        Cancel Pinning
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Places list */}
                            {selectedMap.places.length === 0 ? (
                              <div className="text-center py-8 border border-dashed rounded-md">
                                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-muted-foreground mb-4">
                                  No places added to this map yet
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={createNewPlace}
                                >
                                  <Plus className="h-4 w-4 mr-1.5" />
                                  Add First Place
                                </Button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                {selectedMap.places.map(place => (
                                  <Card 
                                    key={place.id} 
                                    className="overflow-hidden cursor-pointer hover:border-accent/50 transition-colors"
                                    onClick={() => editPlace(place)}
                                  >
                                    <CardHeader className="p-4 pb-2">
                                      <CardTitle className="text-base flex justify-between items-start">
                                        <span className="truncate">{place.name || "Unnamed Place"}</span>
                                        {hasCoordinates(place) && (
                                          <MapPin className="h-4 w-4 flex-shrink-0 text-accent ml-2" />
                                        )}
                                      </CardTitle>
                                      <p className="text-xs text-muted-foreground">
                                        {place.type || "No type specified"}
                                      </p>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                      <p className="text-sm truncate">
                                        {place.lore ? place.lore.substring(0, 60) + (place.lore.length > 60 ? '...' : '') : "No description"}
                                      </p>
                                      {place.characterIds.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {place.characterIds.slice(0, 3).map(id => (
                                            <span key={id} className="text-xs bg-muted px-2 py-0.5 rounded-full truncate max-w-[100px]">
                                              {getCharacterNameById(id)}
                                            </span>
                                          ))}
                                          {place.characterIds.length > 3 && (
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                              +{place.characterIds.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Place Dialog */}
      <Dialog open={showPlaceDialog} onOpenChange={setShowPlaceDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingPlace ? "Add New Place" : "Edit Place"}
            </DialogTitle>
            <DialogDescription>
              Add details about a location in your world
            </DialogDescription>
          </DialogHeader>
          
          {editingPlace && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="place-name" className="mb-2 block">Name</Label>
                  <Input
                    id="place-name"
                    placeholder="Name of this place"
                    value={editingPlace.name}
                    onChange={(e) => handlePlaceInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="place-type" className="mb-2 block">Type of Place</Label>
                  <Select
                    value={editingPlace.type}
                    onValueChange={(value) => handlePlaceInputChange('type', value)}
                  >
                    <SelectTrigger id="place-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {placeTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="place-position" className="mb-2 block">Geographical Position</Label>
                <Input
                  id="place-position"
                  placeholder="e.g., Northern Mountains, Eastern Coast"
                  value={editingPlace.geographicalPosition}
                  onChange={(e) => handlePlaceInputChange('geographicalPosition', e.target.value)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="mb-2 block">Pin on Map</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setIsPinningMode(true);
                    setSelectedPlaceForPinning(editingPlace);
                    setShowPlaceDialog(false);
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  {hasCoordinates(editingPlace) ? "Move Pin" : "Add Pin"}
                </Button>
              </div>
              
              <div>
                <Label htmlFor="place-lore" className="mb-2 block">Lore</Label>
                <Textarea
                  id="place-lore"
                  placeholder="The history and background of this place..."
                  className="min-h-[100px]"
                  value={editingPlace.lore}
                  onChange={(e) => handlePlaceInputChange('lore', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="place-vibe" className="mb-2 block">Vibe/Atmosphere</Label>
                <Textarea
                  id="place-vibe"
                  placeholder="Describe the feel and atmosphere of this place..."
                  className="min-h-[100px]"
                  value={editingPlace.vibe}
                  onChange={(e) => handlePlaceInputChange('vibe', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="place-affiliations" className="mb-2 block">Affiliations</Label>
                <Textarea
                  id="place-affiliations"
                  placeholder="Political alliances, factions, or groups associated with this place..."
                  className="min-h-[100px]"
                  value={editingPlace.affiliations}
                  onChange={(e) => handlePlaceInputChange('affiliations', e.target.value)}
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Character Affiliations</Label>
                {characters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No characters created yet. Create characters in the Character Creation section.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                    {characters.map(character => (
                      <div
                        key={character.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          editingPlace.characterIds.includes(character.id)
                            ? 'bg-accent/20'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleCharacterSelection(character.id)}
                      >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          editingPlace.characterIds.includes(character.id)
                            ? 'bg-accent border-accent text-accent-foreground'
                            : 'border-input'
                        }`}>
                          {editingPlace.characterIds.includes(character.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className="text-sm truncate">{character.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label className="mb-2 block">Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {editingPlace.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={img} 
                        alt={`${editingPlace.name} image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removePlaceImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="border border-dashed rounded-md aspect-square flex flex-col items-center justify-center p-2">
                    <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                    <Input
                      id="placeImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePlaceImageUpload}
                    />
                    <label htmlFor="placeImage" className="text-xs text-center text-muted-foreground cursor-pointer">
                      Upload Image
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowPlaceDialog(false);
                setEditingPlace(null);
                setIsCreatingPlace(false);
              }}
            >
              Cancel
            </Button>
            {!isCreatingPlace && editingPlace && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingPlace) {
                    deletePlaceById(editingPlace.id);
                    setShowPlaceDialog(false);
                    setEditingPlace(null);
                  }
                }}
              >
                Delete Place
              </Button>
            )}
            <Button onClick={savePlace}>
              {isCreatingPlace ? 'Create Place' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer wordCount={0} charCount={0} />
    </div>
  );
}