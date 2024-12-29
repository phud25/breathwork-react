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
  onPatternChange: (value: string) => void;
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
  onToggleSound,
  onPatternChange
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

  // Animation configuration based on current phase
  const getBreathAnimation = () => {
    if (!isActive || isPaused) return { scale: 0.4 };

    const phase = getPhaseVariant();
    const progress = (pattern.sequence[currentPhase] - countdown) / pattern.sequence[currentPhase];

    if (phase === "inhale") {
      return {
        scale: 0.4 + (progress * 0.6), // 0.4 to 1.0
        transition: {
          duration: 1, // Exactly 1 second per count
          type: "spring",
          stiffness: 25,
          damping: 20
        }
      };
    }

    if (phase === "exhale") {
      return {
        scale: 1.0 - (progress * 0.6), // 1.0 to 0.4
        transition: {
          duration: 1,
          type: "spring",
          stiffness: 25,
          damping: 20
        }
      };
    }

    // Hold phase
    return {
      scale: phase === "inhale" ? 1.0 : 0.4,
      transition: {
        duration: 1,
        type: "spring",
        stiffness: 100,
        damping: 30
      }
    };
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-500",
      isZenMode ? "h-screen" : "min-h-[600px] py-8"
    )}>
      <div className={cn(
        "w-full max-w-[600px] mx-auto",
        isZenMode && "hidden"
      )}>
        <div className="space-y-[30px]">
          <Select 
            value={pattern.name.toLowerCase().replace(/\s+/g, '-')}
            onValueChange={onPatternChange}
            className="h-[48px]"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Breathing Pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="478">4-7-8 Relaxation</SelectItem>
              <SelectItem value="box">Box Breathing (4x4)</SelectItem>
              <SelectItem value="22">2-2 Energized Focus</SelectItem>
              <SelectItem value="555">5-5-5 Triangle</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-[5%]">
            <Select defaultValue="breaths" className="w-[50%] h-[48px]">
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
              className="w-[45%] h-[48px] text-center"
              min={1}
            />
          </div>
        </div>
      </div>

      {/* Fixed size circle container */}
      <div className="relative w-[300px] h-[300px] mt-[50px] mb-[50px] flex items-center justify-center">
        {/* Outer static circle */}
        <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-purple-500/10 to-purple-600/20" />

        {/* Middle animated circle */}
        <motion.div
          className={cn(
            "absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r",
            getPhaseColor()
          )}
          initial={{ scale: 0.4 }}
          animate={getBreathAnimation()}
        />

        {/* Inner circle with content */}
        <div className="relative w-[80px] h-[80px] rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/40 border-2 border-primary flex items-center justify-center">
          {isActive ? (
            <div className="text-center pointer-events-none select-none">
              <div className="text-xl font-mono text-primary font-bold">
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

      <div className="w-full max-w-[600px]">
        <div className="flex justify-between items-center text-sm text-primary/80 mb-4">
          <span>Completed Breaths: {breathCount}</span>
          <span>Time: {formatTime(elapsed)}</span>
        </div>

        <div className="flex items-center justify-center gap-[20px]">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSound}
            className="h-[48px] hover:bg-transparent"
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
            className="h-[48px] hover:bg-transparent"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          {isActive && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
                className="h-[48px] hover:bg-transparent"
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
                className="h-[48px]"
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