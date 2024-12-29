import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Timer } from "lucide-react";

interface SessionTimerProps {
  isActive: boolean;
  onStart: () => void;
  onEnd: () => void;
}

export function SessionTimer({ isActive, onStart, onEnd }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5" />
        <span className="font-mono text-xl">{formatTime(seconds)}</span>
      </div>
      
      <Button
        onClick={isActive ? onEnd : onStart}
        variant={isActive ? "destructive" : "default"}
      >
        {isActive ? (
          <>
            <Square className="mr-2 h-4 w-4" />
            End Session
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Session
          </>
        )}
      </Button>
    </div>
  );
}
