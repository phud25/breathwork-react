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
      isZenMode ? "h-screen" : "h-64"
    )}>
      <div className="relative">
        {/* Background rings */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r opacity-50",
            getPhaseColor()
          )}
          initial={false}
          animate={{
            scale: isActive && !isPaused ? [1, 1.5, 1] : 1,
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Main breathing circle */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 border-2 border-primary flex items-center justify-center"
          variants={circleVariants}
          animate={isActive && !isPaused ? getPhaseVariant() : "hold"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="text-primary font-semibold">
                {isActive ? phaseLabels[currentPhase] : "Ready"}
              </div>
              <div className="text-sm text-primary/80 font-mono">
                {formatTime(elapsed)}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-8">
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
  );
}