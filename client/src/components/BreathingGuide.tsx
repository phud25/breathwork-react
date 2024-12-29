import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Maximize2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const circleVariants = {
    inhale: {
      scale: 2,
      transition: { duration: pattern.sequence[currentPhase], ease: "easeInOut" }
    },
    exhale: {
      scale: 1,
      transition: { duration: pattern.sequence[currentPhase], ease: "easeInOut" }
    },
    hold: {
      scale: currentPhase === 1 ? 2 : 1,
      transition: { duration: pattern.sequence[currentPhase] }
    }
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

  return (
    <div className={cn(
      "flex flex-col items-center justify-center transition-all duration-500",
      isZenMode ? "h-screen" : "h-[400px]"
    )}>
      <div className="relative">
        {/* Outer static circle */}
        <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/10 to-purple-600/20" />

        {/* Middle animated circle */}
        <motion.div
          className={cn(
            "absolute w-40 h-40 rounded-full bg-gradient-to-r",
            getPhaseColor()
          )}
          initial={false}
          animate={isActive && !isPaused ? {
            scale: getPhaseVariant() === "inhale" ? 1.5 : 1,
            opacity: [0.4, 0.6, 0.4]
          } : { scale: 1, opacity: 0.4 }}
          transition={{
            duration: isActive && !isPaused ? pattern.sequence[currentPhase] : 0.5,
            ease: "easeInOut"
          }}
        />

        {/* Inner static circle */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/40 border-2 border-primary flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? `${currentPhase}-${countdown}` : 'ready'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              {isActive ? (
                <>
                  <div className="text-3xl font-mono text-primary font-bold">
                    {countdown}
                  </div>
                  <div className="text-sm text-primary/80 font-semibold">
                    {phaseLabels[currentPhase]}
                  </div>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={onStart}
                  className="text-primary hover:text-primary/80"
                >
                  Start Session
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Session info and controls */}
      <div className="mt-8 space-y-4 text-center">
        <div className="text-sm text-primary/80 font-mono">
          {formatTime(elapsed)}
        </div>

        {isActive && (
          <div className="text-sm text-primary/80">
            Completed Breaths: {breathCount}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
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