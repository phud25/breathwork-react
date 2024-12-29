import { useState, useEffect, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useBreathing(sequence: number[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
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
    if (!isActive) return;
    
    setCurrentPhase((prev) => {
      if (prev === sequence.length - 1) {
        setCurrentCycle((c) => c + 1);
        return 0;
      }
      return prev + 1;
    });
  }, [isActive, sequence.length]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive) {
      timer = setInterval(() => {
        progressSequence();
      }, sequence[currentPhase] * 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, currentPhase, sequence, progressSequence]);

  const startSession = () => {
    setIsActive(true);
    setCurrentPhase(0);
    setCurrentCycle(0);
    setStartTime(new Date());
  };

  const endSession = async () => {
    if (!startTime) return;
    
    setIsActive(false);
    const duration = Math.round((Date.now() - startTime.getTime()) / 1000);
    
    await sessionMutation.mutateAsync({
      pattern: sequence.join("-"),
      duration,
      breathCount: currentCycle * sequence.length
    });

    setStartTime(null);
  };

  return {
    isActive,
    currentPhase,
    currentCycle,
    startSession,
    endSession
  };
}
