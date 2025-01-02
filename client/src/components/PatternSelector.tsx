import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wind, Brain, Moon, Timer, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type PatternType = "478" | "box" | "22" | "555" | "24ha" | "fire";

const patterns = [
  {
    id: "478",
    name: "4-7-8 Relaxation",
    description: "Deep calming breath pattern for relaxation and stress relief",
    icon: <Moon className="h-6 w-6" />,
    sequence: [4, 7, 8],
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Equal duration breathing for focus and mental clarity",
    icon: <Timer className="h-6 w-6" />,
    sequence: [4, 4, 4, 4],
  },
  {
    id: "22",
    name: "2-2 Energized Focus",
    description: "Quick energizing pattern to enhance alertness",
    icon: <Brain className="h-6 w-6" />,
    sequence: [2, 2],
  },
  {
    id: "555",
    name: "5-5-5 Triangle",
    description: "Balanced breathing for meditation and mindfulness",
    icon: <Wind className="h-6 w-6" />,
    sequence: [5, 5, 5],
  },
  {
    id: "fire",
    name: "Breath of Fire",
    description: "Rapid energizing breath for vitality and warmth",
    icon: <Flame className="h-6 w-6" />,
    sequence: [0.5, 0.5],
  }
];

interface PatternSelectorProps {
  selected: PatternType;
  onSelect: (pattern: PatternType) => void;
}

export function PatternSelector({ selected, onSelect }: PatternSelectorProps) {
  return (
    <ScrollArea className="w-full pb-4" orientation="horizontal">
      <div className="flex space-x-4 p-1">
        {patterns.map((pattern) => (
          <motion.div
            key={pattern.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                "w-[280px] cursor-pointer transition-all duration-200",
                "hover:border-primary/50 bg-gradient-to-br from-purple-600/20 to-purple-800/10",
                "backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20",
                selected === pattern.id && "ring-2 ring-primary/50"
              )}
              onClick={() => onSelect(pattern.id)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {pattern.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}