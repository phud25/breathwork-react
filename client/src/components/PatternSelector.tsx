import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface PatternSelectorProps {
  selectedPattern: PatternType;
  onPatternChange: (pattern: PatternType) => void;
}

export function PatternSelector({ selectedPattern, onPatternChange }: PatternSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPattern = patterns.find(p => p.id === selectedPattern);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between h-14 px-4 hover:bg-white/5 border-b border-purple-500/20 rounded-none"
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
        <div className="mt-6 grid gap-4">
          {patterns.map((pattern) => (
            <Card
              key={pattern.id}
              className={cn(
                "cursor-pointer transition-all border-purple-500/20 hover:border-purple-500/40",
                pattern.id === selectedPattern && "ring-1 ring-purple-500/30 bg-purple-500/5"
              )}
              onClick={() => {
                onPatternChange(pattern.id);
                setIsOpen(false);
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
      </SheetContent>
    </Sheet>
  );
}
