import { motion, AnimatePresence } from "framer-motion";
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
    if (phase === "inhale") return 1.5;
    if (phase === "exhale") return 1;
    return currentPhase === 1 ? 1.5 : 1; // Hold scale based on whether it's after inhale or exhale
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-500",
      isZenMode ? "h-screen" : "min-h-[600px]"
    )}>
      {/* Session Configuration */}
      <div className={cn(
        "w-full max-w-md space-y-4 mb-8",
        isZenMode && "hidden"
      )}>
        <Select defaultValue="breaths">
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
          placeholder="Enter breath count or duration" 
          className="text-center"
          min={1}
        />
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center">
        {/* Outer static circle */}
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-purple-600/20" />

        {/* Middle animated circle */}
        <motion.div
          className={cn(
            "absolute w-56 h-56 rounded-full bg-gradient-to-r",
            getPhaseColor()
          )}
          initial={false}
          animate={isActive && !isPaused ? {
            scale: getCurrentScale(),
            opacity: 0.5
          } : { 
            scale: 1, 
            opacity: 0.4 
          }}
          transition={{
            duration: isActive && !isPaused ? pattern.sequence[currentPhase] : 0.5,
            ease: "easeInOut"
          }}
        />

        {/* Inner circle with content */}
        <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/40 border-2 border-primary flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? `phase-${currentPhase}-count-${countdown}` : 'ready'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {isActive ? (
                <>
                  <div className="text-4xl font-mono text-primary font-bold mb-2">
                    {countdown}
                  </div>
                  <div className="text-lg text-primary/80 font-semibold">
                    {phaseLabels[currentPhase]}
                  </div>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={onStart}
                  className="text-xl text-primary hover:text-primary/80"
                >
                  Start Session
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Status Display */}
      <div className="w-full max-w-md mt-8">
        <div className="flex justify-between items-center text-sm text-primary/80 mb-4">
          <span>Completed Breaths: {breathCount}</span>
          <span>Time: {formatTime(elapsed)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSound}
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
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          {isActive && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
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