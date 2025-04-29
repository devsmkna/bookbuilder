import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  LayoutGrid,
  Move,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Edit
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/hooks/use-editor";

// Story event types
type EventType = 
  | "incipit" 
  | "inciting-incident"
  | "plot-point" 
  | "turning-point" 
  | "midpoint" 
  | "crisis" 
  | "climax" 
  | "resolution" 
  | "custom";

// Interface for story events
interface StoryEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  position: number;
  characters: string[]; // Character IDs involved in this event
  color?: string; // Optional custom color
  createdAt: Date;
}

// Default colors for different event types
const EVENT_COLORS: Record<EventType, string> = {
  "incipit": "#4E79A7", // Blue
  "inciting-incident": "#F28E2C", // Orange
  "plot-point": "#59A14F", // Green
  "turning-point": "#E15759", // Red
  "midpoint": "#76B7B2", // Turquoise
  "crisis": "#EDC949", // Yellow
  "climax": "#B07AA1", // Purple
  "resolution": "#FF9DA7", // Pink
  "custom": "#9C755F", // Brown
};

// Event type labels
const EVENT_LABELS: Record<EventType, string> = {
  "incipit": "Incipit",
  "inciting-incident": "Inciting Incident",
  "plot-point": "Plot Point",
  "turning-point": "Turning Point",
  "midpoint": "Midpoint",
  "crisis": "Crisis",
  "climax": "Climax",
  "resolution": "Resolution",
  "custom": "Custom Event",
};

// Event type descriptions
const EVENT_DESCRIPTIONS: Record<EventType, string> = {
  "incipit": "The beginning of the story. Introduces the protagonist, setting, and normal world.",
  "inciting-incident": "The event that disrupts the protagonist's normal world and sets the story in motion.",
  "plot-point": "A significant event that drives the story forward and affects the protagonist's journey.",
  "turning-point": "A pivotal moment where the direction of the story changes significantly.",
  "midpoint": "The middle of the story where the protagonist often experiences a revelation or change.",
  "crisis": "A moment of decision for the protagonist, typically preceding the climax.",
  "climax": "The most intense point of the story where the main conflict reaches its peak.",
  "resolution": "The conclusion of the story that resolves the main conflict and ties up loose ends.",
  "custom": "A custom event specific to your story.",
};

export default function StoryboardPlanner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<StoryEvent | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("timeline");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType>("custom");
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { restoreTemporaryContent } = useEditor();

  // Load story events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('book-builder-storyboard');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        setStoryEvents(parsed);
      } catch (e) {
        console.error('Failed to parse saved story events:', e);
      }
    }
  }, []);

  // Save story events to localStorage when updated
  useEffect(() => {
    if (storyEvents.length > 0) {
      localStorage.setItem('book-builder-storyboard', JSON.stringify(storyEvents));
    }
  }, [storyEvents]);

  const createNewEvent = (type: EventType = "custom") => {
    const newPosition = storyEvents.length > 0 
      ? Math.max(...storyEvents.map(event => event.position)) + 1 
      : 0;
    
    const newEvent: StoryEvent = {
      id: Date.now().toString(),
      type,
      title: "",
      description: "",
      position: newPosition,
      characters: [],
      color: EVENT_COLORS[type],
      createdAt: new Date()
    };
    
    setEditingEvent(newEvent);
    setSelectedEventType(type);
    setIsCreatingNew(true);
  };

  const saveEvent = () => {
    if (!editingEvent) return;
    
    // Ensure the event has the correct color based on its type
    const updatedEvent = {
      ...editingEvent,
      color: editingEvent.color || EVENT_COLORS[editingEvent.type]
    };
    
    if (isCreatingNew) {
      setStoryEvents([...storyEvents, updatedEvent]);
      toast({
        title: "Event Created",
        description: `${updatedEvent.title || "New event"} has been created successfully.`
      });
    } else {
      setStoryEvents(storyEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      toast({
        title: "Event Updated",
        description: `${updatedEvent.title} has been updated successfully.`
      });
    }
    
    setIsCreatingNew(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    setStoryEvents(storyEvents.filter(event => event.id !== id));
    
    if (editingEvent && editingEvent.id === id) {
      setEditingEvent(null);
    }
    
    toast({
      title: "Event Deleted",
      description: "The event has been deleted successfully."
    });
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    if (!editingEvent) return;
    
    setEditingEvent({
      ...editingEvent,
      [field]: value
    });
  };
  
  const handleEventTypeChange = (type: EventType) => {
    if (!editingEvent) return;
    
    setSelectedEventType(type);
    setEditingEvent({
      ...editingEvent,
      type,
      color: EVENT_COLORS[type]
    });
  };
  
  const moveEvent = (id: string, direction: "up" | "down") => {
    const eventIndex = storyEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) return;
    
    const event = storyEvents[eventIndex];
    
    // Find the event to swap with
    const targetIndex = direction === "up" 
      ? eventIndex - 1 
      : eventIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= storyEvents.length) return;
    
    const targetEvent = storyEvents[targetIndex];
    
    // Swap positions
    const updatedEvents = [...storyEvents];
    const tempPosition = event.position;
    updatedEvents[eventIndex] = { ...event, position: targetEvent.position };
    updatedEvents[targetIndex] = { ...targetEvent, position: tempPosition };
    
    // Sort by position
    updatedEvents.sort((a, b) => a.position - b.position);
    
    setStoryEvents(updatedEvents);
  };
  
  // Sort events by position
  const sortedEvents = [...storyEvents].sort((a, b) => a.position - b.position);
  
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
            <h1 className="text-2xl font-semibold">Story Planner</h1>
            
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={viewMode === "timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Timeline
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1"
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </Button>
            </div>
          </div>
          
          {/* Create Event Button */}
          <Button
            onClick={() => createNewEvent()}
            className="mb-6"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Story Event
          </Button>
          
          {/* Event Type Buttons */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
            {Object.entries(EVENT_LABELS).slice(0, 8).map(([type, label]) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="flex flex-col py-3 h-auto"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: EVENT_COLORS[type as EventType]
                }}
                onClick={() => createNewEvent(type as EventType)}
              >
                <span>{label}</span>
              </Button>
            ))}
          </div>
          
          {/* Events Display */}
          <div className={`${viewMode === "timeline" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}`}>
            {sortedEvents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="text-xl font-medium mb-2">No Story Events Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your story by adding key events that drive your narrative forward
                  </p>
                  <Button onClick={() => createNewEvent()}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add First Event
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === "timeline" ? (
              // Timeline View
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted z-0"></div>
                {sortedEvents.map((event, index) => (
                  <div key={event.id} className="relative z-10 mb-5">
                    <div className="flex items-start">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0"
                        style={{ backgroundColor: event.color || EVENT_COLORS[event.type] }}
                      >
                        <span className="text-lg font-semibold">{index + 1}</span>
                      </div>
                      <Card className="flex-1 overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                {EVENT_LABELS[event.type]}
                              </div>
                              <CardTitle className="text-lg">{event.title || "Untitled Event"}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === 0}
                                onClick={() => moveEvent(event.id, "up")}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === sortedEvents.length - 1}
                                onClick={() => moveEvent(event.id, "down")}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingEvent(event);
                                  setIsCreatingNew(false);
                                  setSelectedEventType(event.type);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => deleteEvent(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">
                            {event.description || "No description provided."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View
              sortedEvents.map((event, index) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className="h-2"
                    style={{ backgroundColor: event.color || EVENT_COLORS[event.type] }}
                  ></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 flex items-center">
                          <span className="mr-2">{index + 1}.</span>
                          {EVENT_LABELS[event.type]}
                        </div>
                        <CardTitle className="text-lg">{event.title || "Untitled Event"}</CardTitle>
                      </div>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsCreatingNew(false);
                            setSelectedEventType(event.type);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-4 whitespace-pre-wrap">
                      {event.description || "No description provided."}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        disabled={index === 0}
                        onClick={() => moveEvent(event.id, "up")}
                      >
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Move Up
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        disabled={index === sortedEvents.length - 1}
                        onClick={() => moveEvent(event.id, "down")}
                      >
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Move Down
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          {/* Event Editing Dialog */}
          {editingEvent && (
            <Card className="mt-8 border-2 border-primary/20">
              <CardHeader>
                <CardTitle>
                  {isCreatingNew ? "Create New Event" : "Edit Event"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="eventType" className="block mb-2">Event Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(EVENT_LABELS).map(([type, label]) => (
                      <Button
                        key={type}
                        type="button"
                        variant={selectedEventType === type ? "default" : "outline"}
                        className="justify-start"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: EVENT_COLORS[type as EventType]
                        }}
                        onClick={() => handleEventTypeChange(type as EventType)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {EVENT_DESCRIPTIONS[selectedEventType]}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="eventTitle" className="block mb-2">Event Title</Label>
                  <Input
                    id="eventTitle"
                    placeholder="Enter a title for this event"
                    value={editingEvent.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="eventDescription" className="block mb-2">Event Description</Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Describe what happens in this event..."
                    className="min-h-[150px]"
                    value={editingEvent.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingEvent(null);
                    setIsCreatingNew(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={saveEvent}
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {isCreatingNew ? "Create Event" : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      
      <Footer wordCount={0} charCount={0} />
    </div>
  );
}