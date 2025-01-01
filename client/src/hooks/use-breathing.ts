import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useBreathing(sequence: number[]) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedTime, setPausedTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [targetBreaths, setTargetBreaths] = useState<number | null>(null);
  const [targetDuration, setTargetDuration] = useState<number | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [holdCount, setHoldCount] = useState(0);
  const [totalHoldTime, setTotalHoldTime] = useState(0);
  const [longestHold, setLongestHold] = useState(0);

  // Refs for timing precision
  const lastTickTime = useRef<number>(0);
  const animationFrameId = useRef<number>();
  const holdStartTime = useRef<number>(0);

  const queryClient = useQueryClient();

  const sessionMutation = useMutation({
    mutationFn: async (sessionData: {
      pattern: string;
      duration: number;
      breathCount: number;
      holdCount: number;
      totalHoldTime: number;
      longestHold: number;
    }) => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save session");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  // Check if session should end based on targets
  useEffect(() => {
    if (!isActive) return;

    const breathCount = currentCycle * sequence.length + currentPhase;
    if (targetBreaths && breathCount >= targetBreaths) {
      setSessionCompleted(true);
      endSession();
      return;
    }

    if (targetDuration && elapsedTime >= targetDuration) {
      setSessionCompleted(true);
      endSession();
      return;
    }
  }, [currentCycle, currentPhase, elapsedTime, targetBreaths, targetDuration, isActive]);

  const progressSequence = useCallback(() => {
    if (!isActive || isPaused || isHolding) return;

    setCurrentPhase((prev) => {
      if (prev === sequence.length - 1) {
        setCurrentCycle((c) => c + 1);
        return 0;
      }
      return prev + 1;
    });

    // Set the countdown for the next phase
    setCountdown(sequence[currentPhase]);
  }, [isActive, isPaused, isHolding, sequence.length, currentPhase, sequence]);

  // High precision timer using requestAnimationFrame
  useEffect(() => {
    const updateTimer = () => {
      if (!isActive || isPaused || isHolding) return;

      const now = performance.now();
      if (!lastTickTime.current) {
        lastTickTime.current = now;
      }

      const delta = now - lastTickTime.current;
      if (delta >= 1000) { // 1 second has passed
        setCountdown((prev) => {
          if (prev <= 1) {
            progressSequence();
            return sequence[(currentPhase + 1) % sequence.length];
          }
          return prev - 1;
        });
        lastTickTime.current = now;
      }

      animationFrameId.current = requestAnimationFrame(updateTimer);
    };

    if (isActive && !isPaused && !isHolding) {
      animationFrameId.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, isPaused, isHolding, currentPhase, sequence, progressSequence]);

  // Update elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && !isPaused) {
      timer = setInterval(() => {
        if (startTime) {
          const pausedDuration = pausedTime ? (Date.now() - pausedTime.getTime()) : 0;
          setElapsedTime(Math.round((Date.now() - startTime.getTime() - pausedDuration) / 1000));
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, isPaused, startTime, pausedTime]);

  const startSession = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setIsHolding(false);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setStartTime(new Date());
    setPausedTime(null);
    setElapsedTime(0);
    setCountdown(sequence[0]);
    setSessionCompleted(false);
    setHoldCount(0);
    setTotalHoldTime(0);
    setLongestHold(0);
    lastTickTime.current = 0;
    holdStartTime.current = 0;
  }, [sequence]);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
    setPausedTime(new Date());
  }, []);

  const resumeSession = useCallback((phase: number = currentPhase) => {
    setIsPaused(false);
    setIsHolding(false);
    setCurrentPhase(phase);
    // Reset timing state
    if (pausedTime && startTime) {
      const pauseDuration = Date.now() - pausedTime.getTime();
      setStartTime(new Date(startTime.getTime() + pauseDuration));
      setPausedTime(null);
    }
    // Reset animation timing
    lastTickTime.current = performance.now();
    // Reset countdown for the new phase
    setCountdown(sequence[phase]);
  }, [pausedTime, startTime, sequence]);

  const startHold = useCallback(() => {
    if (!isActive || isHolding) return;
    console.log('Starting hold...');
    setIsHolding(true);
    setIsPaused(true);
    holdStartTime.current = Date.now();
  }, [isActive, isHolding]);

  const endHold = useCallback(() => {
    if (!isHolding) return;
    const holdDuration = Math.round((Date.now() - holdStartTime.current) / 1000);
    console.log('Ending hold with duration:', holdDuration);
    console.log('Previous hold stats:', { 
      count: holdCount, 
      totalTime: totalHoldTime, 
      longest: longestHold 
    });

    setHoldCount(prev => prev + 1);
    setTotalHoldTime(prev => prev + holdDuration);
    setLongestHold(prev => Math.max(prev, holdDuration));
    setIsHolding(false);

    // Reset hold timing state
    holdStartTime.current = 0;
    // Force restart from beginning of inhale phase
    setCurrentPhase(0);
    lastTickTime.current = performance.now();
    setCountdown(sequence[0]);
    setIsPaused(false);

    console.log('Updated hold stats:', { 
      count: holdCount + 1, 
      totalTime: totalHoldTime + holdDuration, 
      longest: Math.max(longestHold, holdDuration) 
    });
  }, [isHolding, sequence, holdCount, totalHoldTime, longestHold]);

  const endSession = useCallback(async () => {
    if (!startTime) return;

    // If we're holding when ending, record the hold
    if (isHolding) {
      endHold();
    }

    setIsActive(false);
    setIsPaused(false);
    setIsHolding(false);
    const duration = Math.round((Date.now() - startTime.getTime()) / 1000);

    try {
      await sessionMutation.mutateAsync({
        pattern: sequence.join("-"),
        duration,
        breathCount: currentCycle * sequence.length + currentPhase,
        holdCount,
        totalHoldTime,
        longestHold
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }

    setStartTime(null);
    setPausedTime(null);
    setElapsedTime(0);
    setCountdown(0);
    lastTickTime.current = 0;
    holdStartTime.current = 0;
  }, [startTime, currentCycle, currentPhase, sequence, sessionMutation, holdCount, totalHoldTime, longestHold, isHolding, endHold]);

  return {
    isActive,
    isPaused,
    isHolding,
    currentPhase,
    currentCycle,
    elapsedTime,
    countdown,
    sessionCompleted,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    startHold,
    endHold,
    setTargetBreaths,
    setTargetDuration,
    recordHold: endHold,
    holdStats: {
      holdCount,
      totalHoldTime,
      longestHold
    }
  };
}