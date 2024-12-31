import { useState, useEffect } from "react";
import { motion, type AnimationProps } from "framer-motion";
import { Volume2, VolumeX, Maximize2, Pause, Play, Square, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAudio } from "@/hooks/use-audio";

type PatternType = "478" | "box" | "22" | "555" | "24ha" | "fire";

const phaseLabels = ["Inhale", "Hold", "Exhale", "Hold"];

const phaseColors = {
  inhale: "from-purple-500/20 to-purple-600/40",
  exhale: "from-purple-600/40 to-purple-500/20",
  hold: "from-purple-500/30 to-purple-500/30"
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatHoldTime = formatTime;

const getPhaseLabel = (patternName: string, phase: number) => {
  if (patternName === "2-4 Ha Breath") {
    return phase === 0 ? "Inhale" : "Ha";
  }
  if (patternName.includes("2-2") || patternName === "Breath of Fire") {
    return phase === 0 ? "Inhale" : "Exhale";
  }
  return phaseLabels[phase];
};

const getPhaseVariant = (patternName: string, phase: number) => {
  if (patternName === "2-4 Ha Breath" || patternName.includes("2-2")) {
    return phase === 0 ? "inhale" : "exhale";
  }
  if (phase === 0) return "inhale";
  if (phase === 2) return "exhale";
  return "hold";
};

export function BreathingGuide({
  pattern,
  isActive,
  currentPhase,
  isPaused = false,
  isZenMode = false,
  isSoundEnabled = false,
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
  onPatternChange,
  onHoldComplete
}: BreathingGuideProps) {
  const [sessionType, setSessionType] = useState<"breaths" | "duration">("breaths");
  const [breathCountState, setBreathCountState] = useState<number>(15);
  const [durationInput, setDurationInput] = useState<string>("3:00");
  const [isHolding, setIsHolding] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [holdInterval, setHoldInterval] = useState<NodeJS.Timeout | null>(null);

  const fixedVolume = 0.5; // Fixed volume at 50%
  const backgroundMusic = useAudio('/audio/meditation-bg.mp3', { loop: true, volume: isSoundEnabled ? fixedVolume * 0.6 : 0 });
  const breathSound = useAudio('/audio/breath-sound.mp3', { volume: isSoundEnabled ? fixedVolume : 0 });
  const sessionAudio = useAudio('/audio/2-2bg.mp3', { loop: true, volume: isSoundEnabled ? fixedVolume : 0 });

  useEffect(() => {
    if (isActive && isSoundEnabled && !isPaused && !isHolding) {
      breathSound.play();
    }
  }, [currentPhase, isActive, isSoundEnabled, isPaused, isHolding]);

  useEffect(() => {
    if (isActive && isSoundEnabled) {
      if (isPaused && !isHolding) {
        backgroundMusic.fadeOut();
        sessionAudio.pause();
      } else {
        backgroundMusic.fadeIn();
        sessionAudio.play();
      }
    } else if (!isActive) {
      backgroundMusic.stop();
      sessionAudio.stop();
    }
  }, [isActive, isPaused, isSoundEnabled, isHolding]);

  useEffect(() => {
    return () => {
      backgroundMusic.stop();
      breathSound.stop();
      sessionAudio.stop();
    };
  }, []);

  useEffect(() => {
    if (!isSoundEnabled) {
      backgroundMusic.setVolume(0);
      breathSound.setVolume(0);
      sessionAudio.setVolume(0);
    } else {
      backgroundMusic.setVolume(fixedVolume * 0.6);
      breathSound.setVolume(fixedVolume);
      sessionAudio.setVolume(fixedVolume);
    }
  }, [isSoundEnabled]);

  const startHold = () => {
    if (!isActive || isHolding) return;
    setIsHolding(true);
    onPause();
    const interval = setInterval(() => {
      setHoldTime(prev => prev + 1);
    }, 1000);
    setHoldInterval(interval);

    if (isSoundEnabled) {
      backgroundMusic.play();
      sessionAudio.play();
    }
  };

  const endHold = () => {
    if (holdInterval) {
      clearInterval(holdInterval);
      setHoldInterval(null);
    }
    if (isHolding) {
      onHoldComplete(holdTime);
    }
    setIsHolding(false);
    setHoldTime(0);
    onResume();
  };

  const handleBreathCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 1) {
      setBreathCountState(count);
    }
  };

  const durationOptions = Array.from({ length: 119 }, (_, i) => {
    const totalSeconds = (i + 2) * 30;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return { value, label: value };
  });

  const getPhaseAnimation = (): AnimationProps => {
    const phase = getPhaseVariant(pattern.name, currentPhase);
    const phaseDuration = pattern.sequence[currentPhase];
    const isPostInhale = currentPhase === 1;

    if (!isActive || isPaused) {
      return {
        initial: { scale: 0.3 },
        animate: { scale: 0.3 }
      };
    }

    if (pattern.name === "Breath of Fire") {
      return {
        initial: { scale: phase === "inhale" ? 0.3 : 1 },
        animate: {
          scale: phase === "inhale" ? 1 : 0.3,
          transition: {
            duration: 0.5,
            ease: "linear"
          }
        },
        exit: {
          scale: phase === "inhale" ? 1 : 0.3,
          transition: {
            duration: 0,
          }
        }
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

  return (
    <div className={cn(
      "flex flex-col items-center justify-start transition-all duration-500",
      isZenMode ? "h-screen p-0" : ""
    )}>
      <div className={cn(
        "w-full max-w-[600px] mx-auto space-y-3 transition-all duration-500",
        isZenMode ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100"
      )}>
        <Select
          onValueChange={(value) => onPatternChange(value as PatternType)}
          value={pattern.name === "2-2 Energized Focus" ? "22" :
            pattern.name === "4-7-8 Relaxation" ? "478" :
            pattern.name === "Box Breathing (4x4)" ? "box" :
            pattern.name === "5-5-5 Triangle" ? "555" :
            pattern.name === "2-4 Ha Breath" ? "24ha" :
            pattern.name === "Breath of Fire" ? "fire" : "22"}
        >
          <SelectTrigger className="h-[48px] rounded-xl bg-white/10 border-slate-600 text-[#F5F5DC] hover:brightness-110 hover:border-primary/50 focus:border-primary/50 transition-all">
            <SelectValue placeholder="Select Breathing Pattern" className="text-[#F5F5DC]" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="478" className="text-[#F5F5DC] hover:bg-primary/10">4-7-8 Relaxation</SelectItem>
            <SelectItem value="box" className="text-[#F5F5DC] hover:bg-primary/10">Box Breathing (4x4)</SelectItem>
            <SelectItem value="22" className="text-[#F5F5DC] hover:bg-primary/10">2-2 Energized Focus</SelectItem>
            <SelectItem value="555" className="text-[#F5F5DC] hover:bg-primary/10">5-5-5 Triangle</SelectItem>
            <SelectItem value="24ha" className="text-[#F5F5DC] hover:bg-primary/10">2-4 Ha Breath</SelectItem>
            <SelectItem value="fire" className="text-[#F5F5DC] hover:bg-primary/10">Breath of Fire</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-[5%]">
          <Select
            value={sessionType}
            onValueChange={(value) => setSessionType(value as "breaths" | "duration")}
          >
            <SelectTrigger className="h-[48px] rounded-xl bg-white/10 border-slate-600 hover:brightness-110 hover:border-primary/50 focus:border-primary/50 transition-all">
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
            >
              <SelectTrigger className="h-[48px] rounded-xl bg-white/10 border-slate-600 hover:brightness-110 hover:border-primary/50 focus:border-primary/50 transition-all">
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
              className="w-[45%] h-[48px] rounded-xl text-center bg-white/10 border-slate-600 text-[#F5F5DC] hover:brightness-110 hover:border-primary/50 focus:border-primary/50 focus:ring-primary/50"
              min={1}
            />
          )}
        </div>
      </div>

      <div className={cn("flex items-center justify-center transition-all duration-500", isZenMode ? "h-full scale-120" : "mt-1 mb-1 scale-100")}>
        <div
          className="relative w-[285px] h-[285px] flex items-center justify-center transition-transform duration-500"
          onClick={() => isHolding && endHold()}
        >
          <div className="absolute w-[265px] h-[265px] rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/20 shadow-lg shadow-purple-900/20 transition-all duration-500" />

          <motion.div
            className={cn(
              "absolute w-[265px] h-[265px] rounded-full bg-gradient-to-br",
              phaseColors[getPhaseVariant(pattern.name, currentPhase) as keyof typeof phaseColors],
              isHolding && "animate-pulse"
            )}
            {...(isHolding ? {} : getPhaseAnimation())}
          />

          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-primary flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            {isActive ? (
              <div className="text-center pointer-events-none select-none">
                {isHolding ? (
                  <div className="text-xl font-mono text-[#F5F5DC] font-bold">
                    {formatHoldTime(holdTime)}
                  </div>
                ) : (
                  <>
                    {pattern.name !== "Breath of Fire" && (
                      <div className="text-xl font-mono text-[#F5F5DC] font-bold">
                        {countdown}
                      </div>
                    )}
                    <div className="text-xs text-[#F5F5DC] font-semibold">
                      {getPhaseLabel(pattern.name, currentPhase)}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={onStart}
                className="text-sm text-[#F5F5DC] hover:text-[#F5F5DC]/80 hover:bg-transparent transition-all duration-200 group"
              >
                <span className="relative inline-flex rounded-full animate-ping-slow">Start</span>
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

      <div className={cn(
        "w-full max-w-[600px] transition-all duration-500",
        isZenMode ? "absolute bottom-8 opacity-100" : "opacity-100"
      )}>
        <div className={cn(
          "flex justify-between items-center text-sm text-primary/80 mb-4",
          isZenMode ? "opacity-0 pointer-events-none absolute" : "opacity-100"
        )}>
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
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {isActive && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={isHolding ? endHold : startHold}
                className={cn(
                  "h-[48px] hover:bg-transparent",
                  isHolding && "ring-2 ring-purple-500 ring-opacity-50"
                )}
              >
                <Hand className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? onResume : onPause}
                className="h-[48px] hover:bg-transparent"
                disabled={isHolding}
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
  onHoldComplete: (holdDuration: number) => void;
}