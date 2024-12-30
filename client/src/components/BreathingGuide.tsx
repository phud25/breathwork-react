import { useState, useEffect } from "react";
import { motion, type AnimationProps } from "framer-motion";
import { Volume2, VolumeX, Maximize2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PatternType = "478" | "box" | "22" | "555" | "24ha";

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
  sessionCompleted?: boolean;
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

const durationOptions = Array.from({ length: 119 }, (_, i) => {
  const totalSeconds = (i + 2) * 30;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    value: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    label: `${minutes}:${seconds.toString().padStart(2, '0')}`
  };
});

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
  sessionCompleted = false,
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

  const handleBreathCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 1) {
      setBreathCountState(count);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-start transition-all duration-500",
      isZenMode ? "h-screen p-0" : "min-h-[600px]"
    )}>
      <div className={cn(
        "w-full max-w-[600px] mx-auto space-y-3 transition-opacity duration-300",
        isZenMode ? "opacity-0 hidden" : "opacity-100"
      )}>
        <Select
          value={pattern.name === "2-2 Energized Focus" ? "22" :
            pattern.name === "4-7-8 Relaxation" ? "478" :
            pattern.name === "Box Breathing (4x4)" ? "box" :
            pattern.name === "5-5-5 Triangle" ? "555" :
            pattern.name === "2-4 Ha Breath" ? "24ha" : "22"}
          onValueChange={(value) => onPatternChange(value as PatternType)}
          className="h-[48px] w-full"
        >
          <SelectTrigger className="bg-slate-800 border-slate-600 text-[#F5F5DC] hover:border-primary/50 transition-colors">
            <SelectValue placeholder="Select Breathing Pattern" className="text-[#F5F5DC]" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 pb-4">
            <SelectItem value="478" className="text-[#F5F5DC] hover:bg-primary/10">4-7-8 Relaxation</SelectItem>
            <SelectItem value="box" className="text-[#F5F5DC] hover:bg-primary/10">Box Breathing (4x4)</SelectItem>
            <SelectItem value="22" className="text-[#F5F5DC] hover:bg-primary/10">2-2 Energized Focus</SelectItem>
            <SelectItem value="555" className="text-[#F5F5DC] hover:bg-primary/10">5-5-5 Triangle</SelectItem>
            <SelectItem value="24ha" className="text-[#F5F5DC] hover:bg-primary/10">2-4 Ha Breath</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-[5%]">
          <Select
            value={sessionType}
            onValueChange={(value) => setSessionType(value as "breaths" | "duration")}
            className="w-[50%] h-[48px]"
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Session Type" className="text-[#F5F5DC]" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="breaths" className="text-[#F5F5DC] hover:bg-primary/10">By Breath Count</SelectItem>
              <SelectItem value="duration" className="text-[#F5F5DC] hover:bg-primary/10">By Duration</SelectItem>
            </SelectContent>
          </Select>

          {sessionType === "duration" ? (
            <Select
              value={durationInput}
              onValueChange={setDurationInput}
              className="w-[45%] h-[48px]"
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="3:00" className="text-[#F5F5DC]" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 max-h-[200px]">
                {durationOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-[#F5F5DC] hover:bg-primary/10"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="number"
              value={breathCountState}
              onChange={(e) => handleBreathCountChange(e.target.value)}
              className="w-[45%] h-[48px] text-center bg-slate-800 border-slate-600 text-[#F5F5DC] focus:ring-primary/50"
              min={1}
            />
          )}
        </div>
      </div>

      <div className="mt-0 mb-0">
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
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
                <div className="text-xl font-mono text-[#F5F5DC] font-bold">
                  {countdown}
                </div>
                <div className="text-xs text-[#F5F5DC] font-semibold">
                  {getPhaseLabel()}
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={onStart}
                className="text-sm text-[#F5F5DC] hover:text-[#F5F5DC]/80 hover:bg-transparent transition-colors duration-200"
              >
                Start
              </Button>
            )}
          </div>

          {sessionCompleted && !isActive && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-black/50 text-white text-center whitespace-nowrap">
              Session Complete! Tap Start to begin another session
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[600px] -mt-1">
        <div className="flex justify-between items-center text-sm text-primary/80 mb-4 mt-2">
          <span>Completed Breaths: {breathCount}</span>
          <span>Time: {formatTime(elapsed)}</span>
        </div>

        <div className="flex items-center justify-center gap-[20px] pb-10">
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