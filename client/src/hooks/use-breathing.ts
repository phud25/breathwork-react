import { useState, useEffect, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useBreathing(sequence: number[]) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedTime, setPausedTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  const progressSequence = useCallback(() => {
    if (!isActive || isPaused) return;

    setCurrentPhase((prev) => {
      if (prev === sequence.length - 1) {
        setCurrentCycle((c) => c + 1);
        return 0;
      }
      return prev + 1;
    });
  }, [isActive, isPaused, sequence.length]);

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

  // Progress through breathing sequence
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && !isPaused) {
      timer = setInterval(() => {
        progressSequence();
      }, sequence[currentPhase] * 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, isPaused, currentPhase, sequence, progressSequence]);

  const startSession = () => {
    setIsActive(true);
    setIsPaused(false);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setStartTime(new Date());
    setPausedTime(null);
    setElapsedTime(0);
  };

  const pauseSession = () => {
    setIsPaused(true);
    setPausedTime(new Date());
  };

  const resumeSession = () => {
    setIsPaused(false);
    if (pausedTime && startTime) {
      const pauseDuration = Date.now() - pausedTime.getTime();
      setStartTime(new Date(startTime.getTime() + pauseDuration));
      setPausedTime(null);
    }
  };

  const endSession = async () => {
    if (!startTime) return;

    setIsActive(false);
    setIsPaused(false);
    const duration = Math.round((Date.now() - startTime.getTime()) / 1000);

    await sessionMutation.mutateAsync({
      pattern: sequence.join("-"),
      duration,
      breathCount: currentCycle * sequence.length
    });

    setStartTime(null);
    setPausedTime(null);
    setElapsedTime(0);
  };

  return {
    isActive,
    isPaused,
    currentPhase,
    currentCycle,
    elapsedTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession
  };
}