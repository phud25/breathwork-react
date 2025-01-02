import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type PatternType = "478" | "box" | "22" | "555" | "24ha" | "fire";

interface Pattern {
  id: PatternType;
  name: string;
  description: string;
  sequence: number[];
}

const patterns: Pattern[] = [
  {
    id: "22",
    name: "2-2 Energized Focus",
    description: "Quick, energizing breath pattern for enhanced focus and alertness",
    sequence: [2, 2]
  },
  {
    id: "478",
    name: "4-7-8 Relaxation",
    description: "Calming breath pattern for deep relaxation and stress relief",
    sequence: [4, 7, 8]
  },
  {
    id: "box",
    name: "Box Breathing (4x4)",
    description: "Square breathing pattern for balance and mental clarity",
    sequence: [4, 4, 4, 4]
  },
  {
    id: "555",
    name: "5-5-5 Triangle",
    description: "Balanced triangular breathing for meditation and focus",
    sequence: [5, 5, 5]
  },
  {
    id: "24ha",
    name: "2-4 Ha Breath",
    description: "Energetic breath pattern with vocal release",
    sequence: [2, 4]
  },
  {
    id: "fire",
    name: "Breath of Fire",
    description: "Rapid breathing technique for energy and vitality",
    sequence: [0.5, 0.5]
  }
];

// Generate duration options from 30 seconds to 60 minutes
const durationOptions = Array.from({ length: 119 }, (_, i) => {
  const totalSeconds = (i + 2) * 30;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    value: totalSeconds,
    label: `${minutes}:${seconds.toString().padStart(2, '0')} Minutes`
  };
});

interface PatternSelectorProps {
  selectedPattern: PatternType;
  onPatternChange: (pattern: PatternType) => void;
  selectedDuration?: number;
  onDurationChange?: (duration: number) => void;
}

export function PatternSelector({ 
  selectedPattern, 
  onPatternChange,
  selectedDuration = 180, // Default 3:00 minutes
  onDurationChange 
}: PatternSelectorProps) {
  const [isPatternOpen, setIsPatternOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);

  const currentPattern = patterns.find(p => p.id === selectedPattern);
  const currentDuration = durationOptions.find(d => d.value === selectedDuration) || durationOptions[5]; // 3:00 default

  return (
    <div className="flex items-center justify-between border-b border-purple-500/20">
      <Sheet open={isPatternOpen} onOpenChange={setIsPatternOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex-1 justify-between h-14 px-4 hover:bg-white/5 rounded-none"
          >
            <span className="text-lg font-medium text-[rgb(167,139,250)]">
              {currentPattern?.name}
            </span>
            <ChevronDown className="h-4 w-4 text-[rgb(167,139,250)]" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] bg-background/95 backdrop-blur-md border-t border-purple-500/20"
        >
          <SheetHeader>
            <SheetTitle className="text-[rgb(167,139,250)]">Select Breathing Pattern</SheetTitle>
            <SheetDescription>
              Choose a pattern that matches your current needs
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-120px)] mt-6">
            <div className="grid gap-4 pr-4">
              {patterns.map((pattern) => (
                <Card
                  key={pattern.id}
                  className={cn(
                    "cursor-pointer transition-all border-purple-500/20 hover:border-purple-500/40",
                    pattern.id === selectedPattern && "ring-1 ring-purple-500/30 bg-purple-500/5"
                  )}
                  onClick={() => {
                    onPatternChange(pattern.id);
                    setIsPatternOpen(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="font-medium mb-1">{pattern.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {pattern.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={isDurationOpen} onOpenChange={setIsDurationOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-14 px-4 hover:bg-white/5 rounded-none border-l border-purple-500/20"
          >
            <span className="text-lg font-medium text-[rgb(167,139,250)]">
              {currentDuration.label}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 text-[rgb(167,139,250)]" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] bg-background/95 backdrop-blur-md border-t border-purple-500/20"
        >
          <SheetHeader>
            <SheetTitle className="text-[rgb(167,139,250)]">Select Duration</SheetTitle>
            <SheetDescription>
              Choose how long you want to practice
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-120px)] mt-6">
            <div className="grid gap-4 pr-4">
              {durationOptions.map((duration) => (
                <Card
                  key={duration.value}
                  className={cn(
                    "cursor-pointer transition-all border-purple-500/20 hover:border-purple-500/40",
                    duration.value === selectedDuration && "ring-1 ring-purple-500/30 bg-purple-500/5"
                  )}
                  onClick={() => {
                    onDurationChange?.(duration.value);
                    setIsDurationOpen(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{duration.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}