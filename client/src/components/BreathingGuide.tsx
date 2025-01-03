import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, type AnimationProps } from "framer-motion";
import { Volume2, VolumeX, Square, Maximize, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAudio } from "@/hooks/use-audio";

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
  onResume: (phase: number) => void;
  onStop: () => void;
  onToggleZen: () => void;
  onToggleSound: () => void;
  onHoldComplete: (holdDuration: number) => void;
  isHolding: boolean;
  currentHoldTime: number;
  onStartHold: () => void;
  onEndHold: () => void;
}

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
  onHoldComplete,
  isHolding,
  currentHoldTime,
  onStartHold,
  onEndHold
}: BreathingGuideProps) {
  // Track animation state separately from breathing phase
  const [animationPhase, setAnimationPhase] = useState(currentPhase);
  const [animationScale, setAnimationScale] = useState(0.3);
  const preHoldPhase = useRef(currentPhase);

  const fixedVolume = 0.5;
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
    if (isSoundEnabled) {
      backgroundMusic.setVolume(fixedVolume * 0.6);
      breathSound.setVolume(fixedVolume);
      sessionAudio.setVolume(fixedVolume);
    } else {
      backgroundMusic.setVolume(0);
      breathSound.setVolume(0);
      sessionAudio.setVolume(0);
    }
  }, [isSoundEnabled]);

  // Track current phase for animation
  useEffect(() => {
    if (!isHolding) {
      setAnimationPhase(currentPhase);
      const phase = getPhaseVariant(pattern.name, currentPhase);
      setAnimationScale(phase === "inhale" ? 1 : 0.3);
    }
  }, [currentPhase, isHolding, pattern.name]);

  const handleStartHold = () => {
    preHoldPhase.current = currentPhase;
    onStartHold();
  };

  const handleEndHold = () => {
    onEndHold();
    // Force animation to inhale state
    setAnimationScale(0.3);
    setAnimationPhase(0);
  };

  const handleZenToggle = () => {
    onToggleZen();
  };

  const handleStop = () => {
    if (isHolding) {
      handleEndHold();
    }
    onStop();
  };

  const getPhaseAnimation = (): AnimationProps => {
    if (!isActive || isPaused) {
      return {
        initial: { scale: 0.3 },
        animate: { scale: 0.3 }
      };
    }

    if (isHolding) {
      return {
        initial: { scale: 1 },
        animate: { scale: 1 }
      };
    }

    const phaseDuration = pattern.sequence[currentPhase];
    const phase = getPhaseVariant(pattern.name, currentPhase);

    if (pattern.name === "Breath of Fire") {
      return {
        initial: { scale: phase === "inhale" ? 0.3 : 1 },
        animate: {
          scale: phase === "inhale" ? 1 : 0.3,
          transition: {
            duration: 0.3,
            ease: "linear",
            type: "keyframes",
            times: [0, 1],
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

    // Hold phases
    return {
      initial: { scale: currentPhase === 1 ? 1 : 0.3 },
      animate: { scale: currentPhase === 1 ? 1 : 0.3 }
    };
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-start transition-all duration-500",
      isZenMode ? "h-screen p-0" : ""
    )}>
      <div className={cn(
        "flex items-center justify-center transition-all duration-500 breath-circle relative",
        isZenMode ? "h-full scale-120" : "mt-6 mb-8 scale-100"
      )}>
        <div
          className="relative w-[313px] h-[313px] flex items-center justify-center transition-transform duration-500"
          onClick={() => isHolding && handleEndHold()}
        >
          <div className="absolute w-[291px] h-[291px] rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/20 shadow-lg shadow-purple-900/20 transition-all duration-500" />

          <motion.div
            className={cn(
              "absolute w-[291px] h-[291px] rounded-full bg-gradient-to-br",
              phaseColors[getPhaseVariant(pattern.name, animationPhase) as keyof typeof phaseColors],
              isHolding && "animate-pulse"
            )}
            {...getPhaseAnimation()}
          />

          <div
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-primary flex items-center justify-center shadow-lg transition-transform cursor-pointer hover:scale-105 animate-pulse"
            onClick={(e) => {
              e.stopPropagation();
              if (isActive) {
                if (isHolding) {
                  handleEndHold();
                } else if (!isPaused) {
                  onPause();
                } else {
                  onResume(0);
                }
              } else {
                onStart();
              }
            }}
          >
            {isActive ? (
              <div className="text-center pointer-events-none select-none">
                {isHolding ? (
                  <div className="flex flex-col items-center">
                    <div className="text-xl font-mono text-[#F5F5DC] font-bold">
                      {formatTime(currentHoldTime)}
                    </div>
                    <div className="text-xs text-[#F5F5DC] font-semibold mt-1">
                      Hold
                    </div>
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
                className="text-sm text-[#F5F5DC] hover:text-[#F5F5DC]/80 hover:bg-transparent transition-all duration-200 group"
              >
                <span className="relative inline-flex rounded-full animate-ping-slow">Start</span>
              </Button>
            )}
          </div>

          <AnimatePresence>
            {sessionCompleted && !isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
              >
                <motion.div
                  className="px-4 py-2 rounded bg-black/50 text-white"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Session complete! Well done.<br />
                  Click Start to go again...
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={cn(
        "w-full max-w-[600px] transition-all duration-500 controls",
        isZenMode ? "absolute bottom-8 opacity-100" : "opacity-100"
      )}>
        <div className={cn(
          "flex justify-between items-center text-sm mb-4 non-essential text-[rgb(167,139,250)]",
          isZenMode && "opacity-0 pointer-events-none"
        )}>
          <div>Breaths: {breathCount}</div>
          <div>Time: {formatTime(elapsed)}</div>
        </div>

        <div className="flex items-center justify-center gap-[20px]">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSound}
            className="h-[56px] w-[56px] hover:bg-transparent control-icon bg-white/25 backdrop-blur-sm hover:bg-white/35 transition-colors rounded-xl"
          >
            {isSoundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={isHolding ? handleEndHold : handleStartHold}
            disabled={!isActive}
            className={cn(
              "h-[56px] w-[56px] hover:bg-transparent control-icon bg-white/25 backdrop-blur-sm hover:bg-white/35 transition-colors rounded-xl",
              isHolding && "ring-2 ring-purple-500 ring-opacity-50",
              !isActive && "opacity-50 cursor-not-allowed"
            )}
          >
            <Hand className="h-6 w-6" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={handleStop}
            disabled={!isActive}
            className={cn(
              "h-[56px] w-[56px] control-icon bg-white/25 backdrop-blur-sm hover:bg-white/35 transition-colors rounded-xl",
              !isActive && "opacity-50 cursor-not-allowed"
            )}
          >
            <Square className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleZenToggle}
            className={cn(
              "h-[56px] w-[56px] hover:bg-transparent control-icon bg-white/25 backdrop-blur-sm hover:bg-white/35 transition-colors rounded-xl",
              isZenMode ? "opacity-50 hover:opacity-100" : ""
            )}
          >
            <Maximize className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}