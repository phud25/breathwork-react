import { useState } from "react";
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
  const [sessionType, setSessionType] = useState<"breaths" | "duration">("breaths");
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [durationSeconds, setDurationSeconds] = useState(0);

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

  const circleAnimation = {
    initial: { scale: 0.3 },
    animate: {
      scale: getPhaseVariant() === "inhale" ? 1 : 0.3,
      transition: {
        duration: pattern.sequence[currentPhase],
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 35,
        damping: 25,
        mass: 1.2
      }
    }
  };

  const handleDurationChange = (value: string) => {
    const [minutes, seconds] = value.split(":").map(Number);
    if (minutes >= 1 && minutes <= 60 && seconds >= 0 && seconds < 60) {
      setDurationMinutes(minutes);
      setDurationSeconds(seconds);
    }
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
        <div className="space-y-5">
          <Select 
            value={pattern.name.toLowerCase().replace(/\s+/g, '-')}
            onValueChange={onPatternChange}
            className="h-[48px]"
          >
            <SelectTrigger className="bg-background border-input hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Select Breathing Pattern" />
            </SelectTrigger>
            <SelectContent className="bg-background border-input">
              <SelectItem value="478" className="hover:bg-primary/10">4-7-8 Relaxation</SelectItem>
              <SelectItem value="box" className="hover:bg-primary/10">Box Breathing (4x4)</SelectItem>
              <SelectItem value="22" className="hover:bg-primary/10">2-2 Energized Focus</SelectItem>
              <SelectItem value="555" className="hover:bg-primary/10">5-5-5 Triangle</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-[5%] mb-5">
            <Select
              value={sessionType}
              onValueChange={(value) => setSessionType(value as "breaths" | "duration")}
              className="w-[50%] h-[48px]"
            >
              <SelectTrigger className="bg-background border-input hover:border-primary/50">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent className="bg-background border-input">
                <SelectItem value="breaths">By Breath Count</SelectItem>
                <SelectItem value="duration">By Duration</SelectItem>
              </SelectContent>
            </Select>

            {sessionType === "duration" ? (
              <Input 
                type="text"
                value={`${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-[45%] h-[48px] text-center bg-background"
                min="1:00"
                max="60:00"
                pattern="\d{1,2}:\d{2}"
              />
            ) : (
              <Input 
                type="number"
                placeholder="Enter count"
                defaultValue="15"
                className="w-[45%] h-[48px] text-center bg-background"
                min={1}
              />
            )}
          </div>
        </div>
      </div>

      {/* Fixed size circle container */}
      <div className="relative w-[300px] h-[300px] mt-5 mb-[15px] flex items-center justify-center">
        {/* Outer static circle */}
        <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-purple-500/10 to-purple-600/20" />

        {/* Middle animated circle */}
        <motion.div
          className={cn(
            "absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r",
            getPhaseColor()
          )}
          initial={circleAnimation.initial}
          animate={circleAnimation.animate}
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