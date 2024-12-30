import { useState, useEffect } from "react";
import { motion, type AnimationProps } from "framer-motion";
import { Volume2, VolumeX, Maximize2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PatternType = "478" | "box" | "22" | "555";

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
  onPatternChange: (value: PatternType) => void;
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
  const [sessionType, setSessionType] = useState<"breaths" | "duration">("breaths");
  const [breathCountState, setBreathCountState] = useState<number>(15);
  const [durationInput, setDurationInput] = useState<string>("3:00");

  useEffect(() => {
    if (sessionType === "duration") {
      const [minutes, seconds] = durationInput.split(":").map(Number);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        console.log("Duration updated:", { minutes, seconds });
      }
    }
  }, [sessionType, durationInput]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseVariant = () => {
    if (pattern.name.includes("2-2") && currentPhase === 1) {
      return "exhale";
    }

    if (currentPhase === 0) return "inhale";
    if (currentPhase === 2) return "exhale";
    return "hold";
  };

  const getPhaseLabel = () => {
    if (pattern.name.includes("2-2")) {
      return currentPhase === 0 ? "Inhale" : "Exhale";
    }
    return phaseLabels[currentPhase];
  };

  const getPhaseColor = () => {
    return phaseColors[getPhaseVariant() as keyof typeof phaseColors];
  };

  const getPhaseAnimation = (): AnimationProps => {
    const phase = getPhaseVariant();
    const phaseDuration = pattern.sequence[currentPhase];
    const isPostInhale = currentPhase === 1;

    console.log("Animation phase:", { phase, phaseDuration, currentPhase });

    if (!isActive || isPaused) {
      return {
        initial: { scale: 0.3 },
        animate: { scale: 0.3 }
      };
    }

    if (phase === "inhale") {
      return {
        initial: { scale: 0.3 },
        animate: {
          scale: 1,
          transition: {
            duration: phaseDuration,
            ease: "easeInOut"
          }
        }
      };
    }

    if (phase === "exhale") {
      return {
        initial: { scale: 1 },
        animate: {
          scale: 0.3,
          transition: {
            duration: phaseDuration,
            ease: "easeInOut"
          }
        }
      };
    }

    return {
      initial: { scale: isPostInhale ? 1 : 0.3 },
      animate: {
        scale: isPostInhale ? 1 : 0.3,
        transition: {
          duration: phaseDuration
        }
      }
    };
  };

  const handleDurationChange = (value: string) => {
    if (!/^\d{1,2}:\d{2}$/.test(value)) return;

    const [minutes, seconds] = value.split(":").map(Number);

    if (minutes >= 1 && minutes <= 60 && seconds >= 0 && seconds < 60) {
      setDurationInput(value);
    }
  };

  const handleBreathCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 1) {
      setBreathCountState(count);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center max-h-[100vh] transition-all duration-500",
      isZenMode ? "h-screen p-0" : "min-h-[600px] p-4"
    )}>
      <div className={cn(
        "w-full max-w-[600px] mx-auto",
        isZenMode && "hidden"
      )}>
        <div className="space-y-2">
          <Select
            value={pattern.name.toLowerCase().replace(/\s+/g, '-')}
            onValueChange={(value) => onPatternChange(value as PatternType)}
            className="h-[48px]"
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select Breathing Pattern" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="478" className="text-white hover:bg-primary/10">4-7-8 Relaxation</SelectItem>
              <SelectItem value="box" className="text-white hover:bg-primary/10">Box Breathing (4x4)</SelectItem>
              <SelectItem value="22" className="text-white hover:bg-primary/10">2-2 Energized Focus</SelectItem>
              <SelectItem value="555" className="text-white hover:bg-primary/10">5-5-5 Triangle</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-[5%] mb-1">
            <Select
              value={sessionType}
              onValueChange={(value) => setSessionType(value as "breaths" | "duration")}
              className="w-[50%] h-[48px]"
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:border-primary/50">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="breaths" className="text-white hover:bg-primary/10">By Breath Count</SelectItem>
                <SelectItem value="duration" className="text-white hover:bg-primary/10">By Duration</SelectItem>
              </SelectContent>
            </Select>

            {sessionType === "duration" ? (
              <Input
                type="text"
                value={durationInput}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-[45%] h-[48px] text-center bg-slate-800 border-slate-600 text-white"
                placeholder="3:00"
                min="1:00"
                max="60:00"
              />
            ) : (
              <Input
                type="number"
                value={breathCountState}
                onChange={(e) => handleBreathCountChange(e.target.value)}
                className="w-[45%] h-[48px] text-center bg-slate-800 border-slate-600 text-white"
                min={1}
              />
            )}
          </div>
        </div>
      </div>

      <div className="relative w-[300px] h-[300px] mt-1 mb-2 flex items-center justify-center">
        <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-purple-500/10 to-purple-600/20" />

        <motion.div
          className={cn(
            "absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r",
            getPhaseColor()
          )}
          {...getPhaseAnimation()}
        />

        <div className="relative w-[80px] h-[80px] rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/40 border-2 border-primary flex items-center justify-center">
          {isActive ? (
            <div className="text-center pointer-events-none select-none">
              <div className="text-xl font-mono text-primary font-bold">
                {countdown}
              </div>
              <div className="text-xs text-primary/80 font-semibold">
                {getPhaseLabel()}
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
        <div className="flex justify-between items-center text-sm text-primary/80 mb-2">
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