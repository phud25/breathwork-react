import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useBreathing(sequence: number[]) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedTime, setPausedTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [targetBreaths, setTargetBreaths] = useState<number | null>(null);
  const [targetDuration, setTargetDuration] = useState<number | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Refs for timing precision
  const lastTickTime = useRef<number>(0);
  const animationFrameId = useRef<number>();

  const queryClient = useQueryClient();

  const sessionMutation = useMutation({
    mutationFn: async (sessionData: {
      pattern: string;
      duration: number;
      breathCount: number;
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
    if (!isActive || isPaused) return;
    console.log('Progressing sequence:', { currentPhase, currentCycle });

    setCurrentPhase((prev) => {
      if (prev === sequence.length - 1) {
        setCurrentCycle((c) => c + 1);
        return 0;
      }
      return prev + 1;
    });

    // Set the countdown for the next phase
    setCountdown(sequence[currentPhase]);
  }, [isActive, isPaused, sequence.length, currentPhase, sequence]);

  // High precision timer using requestAnimationFrame
  useEffect(() => {
    const updateTimer = () => {
      if (!isActive || isPaused) return;

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

    if (isActive && !isPaused) {
      animationFrameId.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, isPaused, currentPhase, sequence, progressSequence]);

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
    console.log('Starting session');
    setIsActive(true);
    setIsPaused(false);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setStartTime(new Date());
    setPausedTime(null);
    setElapsedTime(0);
    setCountdown(sequence[0]);
    setSessionCompleted(false);
    lastTickTime.current = 0;
  }, [sequence]);

  const pauseSession = useCallback(() => {
    console.log('Pausing session');
    setIsPaused(true);
    setPausedTime(new Date());
  }, []);

  const resumeSession = useCallback(() => {
    console.log('Resuming session');
    setIsPaused(false);
    if (pausedTime && startTime) {
      const pauseDuration = Date.now() - pausedTime.getTime();
      setStartTime(new Date(startTime.getTime() + pauseDuration));
      setPausedTime(null);
    }
    lastTickTime.current = 0;
  }, [pausedTime, startTime]);

  const endSession = useCallback(async () => {
    console.log('Ending session');
    if (!startTime) return;

    setIsActive(false);
    setIsPaused(false);
    const duration = Math.round((Date.now() - startTime.getTime()) / 1000);

    await sessionMutation.mutateAsync({
      pattern: sequence.join("-"),
      duration,
      breathCount: currentCycle * sequence.length + currentPhase
    });

    setStartTime(null);
    setPausedTime(null);
    setElapsedTime(0);
    setCountdown(0);
    lastTickTime.current = 0;
  }, [startTime, currentCycle, currentPhase, sequence, sessionMutation]);

  return {
    isActive,
    isPaused,
    currentPhase,
    currentCycle,
    elapsedTime,
    countdown,
    sessionCompleted,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    setTargetBreaths,
    setTargetDuration
  };
}