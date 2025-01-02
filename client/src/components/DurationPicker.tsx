import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const durations = [
  { label: "1:30", value: 90 },
  { label: "2:00", value: 120 },
  { label: "2:30", value: 150 },
  { label: "3:00", value: 180 },
  { label: "3:30", value: 210 },
  { label: "4:00", value: 240 },
  { label: "4:30", value: 270 },
  { label: "5:00", value: 300 },
];

interface DurationPickerProps {
  value: number;
  onChange: (duration: number) => void;
}

export function DurationPicker({ value, onChange }: DurationPickerProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar">
      {durations.map((duration) => (
        <motion.div
          key={duration.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(duration.value)}
            className={cn(
              "min-w-[70px] transition-all duration-200",
              "hover:border-primary/50 bg-gradient-to-br from-purple-600/20 to-purple-800/10",
              "backdrop-blur-sm shadow-sm shadow-purple-900/10 border-purple-500/20",
              value === duration.value && "ring-2 ring-primary/50 bg-primary/10"
            )}
          >
            {duration.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
