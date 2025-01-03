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
  const [finalTime, setFinalTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Hold-specific state
  const [holdCount, setHoldCount] = useState(0);
  const [totalHoldTime, setTotalHoldTime] = useState(0);
  const [longestHold, setLongestHold] = useState(0);
  const [currentHoldTime, setCurrentHoldTime] = useState(0);
  const holdStartTime = useRef<number>(0);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  // Animation frame reference
  const lastTickTime = useRef<number>(0);
  const animationFrameId = useRef<number>();

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

  // Start hold tracking
  const startHold = useCallback(() => {
    if (!isActive || isHolding) return;

    console.log('Starting hold...');
    setIsHolding(true);
    setIsPaused(true);
    holdStartTime.current = Date.now();
    setCurrentHoldTime(0);

    // Start the hold timer
    holdInterval.current = setInterval(() => {
      const currentDuration = Math.round((Date.now() - holdStartTime.current) / 1000);
      setCurrentHoldTime(currentDuration);
    }, 100); // Update more frequently for smoother display
  }, [isActive, isHolding]);

  // End hold and update metrics
  const endHold = useCallback(() => {
    if (!isHolding) return;

    const holdDuration = Math.round((Date.now() - holdStartTime.current) / 1000);
    console.log('Ending hold with duration:', holdDuration);

    // Clear the hold interval
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }

    // Update hold metrics
    setHoldCount(prev => prev + 1);
    setTotalHoldTime(prev => prev + holdDuration);
    setLongestHold(prev => Math.max(prev, holdDuration));
    setCurrentHoldTime(0);

    // Reset hold state
    setIsHolding(false);
    holdStartTime.current = 0;

    // Force restart from beginning of inhale phase
    setCurrentPhase(0);
    setIsPaused(false);
    lastTickTime.current = performance.now();
    setCountdown(sequence[0]);

    console.log('Updated hold metrics:', {
      count: holdCount + 1,
      totalTime: totalHoldTime + holdDuration,
      longest: Math.max(longestHold, holdDuration)
    });
  }, [isHolding, sequence, holdCount, totalHoldTime, longestHold]);

  // Sequence progression
  const progressSequence = useCallback(() => {
    if (!isActive || isPaused || isHolding) return;

    setCurrentPhase((prev) => {
      if (prev === sequence.length - 1) {
        setCurrentCycle((c) => c + 1);
        return 0;
      }
      return prev + 1;
    });

    setCountdown(sequence[currentPhase]);
  }, [isActive, isPaused, isHolding, sequence.length, currentPhase, sequence]);

  // High precision timer
  useEffect(() => {
    const updateTimer = () => {
      if (!isActive || isPaused || isHolding) return;

      const now = performance.now();
      if (!lastTickTime.current) {
        lastTickTime.current = now;
      }

      const delta = now - lastTickTime.current;
      if (delta >= 1000) {
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
          const currentElapsed = Math.round((Date.now() - startTime.getTime() - pausedDuration) / 1000);
          setElapsedTime(currentElapsed);
          setFinalTime(currentElapsed); // Update final time continuously
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, isPaused, startTime, pausedTime]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (holdInterval.current) {
        clearInterval(holdInterval.current);
      }
    };
  }, []);

  const startSession = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setIsHolding(false);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setStartTime(new Date());
    setPausedTime(null);
    setElapsedTime(0);
    setFinalTime(0);
    setCountdown(sequence[0]);
    setSessionCompleted(false);
    setHoldCount(0);
    setTotalHoldTime(0);
    setLongestHold(0);
    setCurrentHoldTime(0);
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

    if (pausedTime && startTime) {
      const pauseDuration = Date.now() - pausedTime.getTime();
      setStartTime(new Date(startTime.getTime() + pauseDuration));
      setPausedTime(null);
    }

    lastTickTime.current = performance.now();
    setCountdown(sequence[phase]);
  }, [pausedTime, startTime, sequence, currentPhase]);

  const endSession = useCallback(async () => {
    if (!startTime) return;

    if (isHolding) {
      endHold();
    }

    const finalDuration = Math.round((Date.now() - startTime.getTime()) / 1000);
    setFinalTime(finalDuration); // Store final time before ending
    setElapsedTime(finalDuration);

    setIsActive(false);
    setIsPaused(false);
    setIsHolding(false);

    try {
      await sessionMutation.mutateAsync({
        pattern: sequence.join("-"),
        duration: finalDuration,
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
    setCountdown(0);
    lastTickTime.current = 0;
    holdStartTime.current = 0;
  }, [
    startTime, currentCycle, currentPhase, sequence,
    sessionMutation, holdCount, totalHoldTime, longestHold,
    isHolding, endHold
  ]);

  return {
    isActive,
    isPaused,
    isHolding,
    currentPhase,
    currentCycle,
    elapsedTime: isActive ? elapsedTime : finalTime, // Return final time when session is not active
    countdown,
    sessionCompleted,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    startHold,
    endHold,
    holdStats: {
      holdCount,
      totalHoldTime,
      longestHold,
      currentHoldTime
    }
  };
}