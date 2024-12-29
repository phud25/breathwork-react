import { motion } from "framer-motion";
import { Volume2, VolumeX, Maximize2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BreathingGuideProps {
  pattern: {
    name: string;
    sequence: number[];
  };
  isActive: boolean;
  currentPhase: number;
  isPaused?: boolean;
  isZenMode?: boolean;
  isSoundEnabled?: boolean;
  elapsed: number;
  breathCount: number;
  countdown: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleZen: () => void;
  onToggleSound: () => void;
}

const phaseLabels = ["Inhale", "Hold", "Exhale", "Hold"];
const phaseColors = {
  inhale: "from-purple-500/20 to-purple-600/40",
  exhale: "from-purple-600/40 to-purple-500/20",
  hold: "from-purple-500/30 to-purple-500/30"
};

export function BreathingGuide({ 
  pattern, 
  isActive, 
  currentPhase,
  isPaused = false,
  isZenMode = false,
  isSoundEnabled = true,
  elapsed,
  breathCount,
  countdown,
  onStart,
  onPause,
  onResume,
  onStop,
  onToggleZen,
  onToggleSound
}: BreathingGuideProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseVariant = () => {
    if (currentPhase === 0) return "inhale";
    if (currentPhase === 2) return "exhale";
    return "hold";
  };

  const getPhaseColor = () => {
    const phase = getPhaseVariant();
    return phaseColors[phase as keyof typeof phaseColors];
  };

  const getCurrentScale = () => {
    const phase = getPhaseVariant();
    const minScale = 1;
    const maxScale = 1.12; 
    if (phase === "inhale") return maxScale;
    if (phase === "exhale") return minScale;
    return currentPhase === 1 ? maxScale : minScale;
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-500",
      isZenMode ? "h-screen" : "min-h-[600px] py-8"
    )}>
      <div className={cn(
        "w-full max-w-md mb-12",
        isZenMode && "hidden"
      )}>
        <div className="space-y-[30px]"> 
          <Select defaultValue="478">
            <SelectTrigger>
              <SelectValue placeholder="Select Breathing Pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="478">4-7-8 Relaxation</SelectItem>
              <SelectItem value="box">Box Breathing (4x4)</SelectItem>
              <SelectItem value="555">5-5-5 Triangle</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-4">
            <Select defaultValue="breaths" className="flex-1">
              <SelectTrigger>
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breaths">By Breath Count</SelectItem>
                <SelectItem value="duration">By Duration</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              type="number" 
              placeholder="Enter count"
              defaultValue="15"
              className="w-32 text-center"
              min={1}
            />
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-12">
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-purple-600/20" />

        <motion.div
          className={cn(
            "absolute w-56 h-56 rounded-full bg-gradient-to-r",
            getPhaseColor()
          )}
          initial={false}
          animate={{
            scale: getCurrentScale(),
          }}
          transition={{
            type: "spring",
            stiffness: 25,
            damping: 15,
            mass: 1,
            duration: isActive && !isPaused ? pattern.sequence[currentPhase] : 0.5,
          }}
        />

        <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/40 border-2 border-primary flex items-center justify-center">
          {isActive ? (
            <div className="text-center pointer-events-none select-none">
              <div className="text-2xl font-mono text-primary font-bold">
                {countdown}
              </div>
              <div className="text-xs text-primary/80 font-semibold">
                {phaseLabels[currentPhase]}
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={onStart}
              className="text-sm text-primary hover:text-primary/80 hover:bg-transparent transition-colors duration-200"
            >
              Start
            </Button>
          )}
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-between items-center text-sm text-primary/80 mb-4">
          <span>Completed Breaths: {breathCount}</span>
          <span>Time: {formatTime(elapsed)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSound}
            className="hover:bg-transparent"
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleZen}
            className="hover:bg-transparent"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          {isActive && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
                className="hover:bg-transparent"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={onStop}
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}