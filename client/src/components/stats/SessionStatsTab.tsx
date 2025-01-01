import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface SessionSet {
  id: number;
  pattern: string;
  breathCount: number;
  holdCount: number;
  avgHoldTime: number;
  longestHold: number;
  isActive: boolean;
  breathTime?: number;
}

interface SessionStats {
  sets: SessionSet[];
  totalBreaths: number;
  totalHoldCount: number;
  totalBreathTime: number;
  totalHoldTime: number;
}

const formatHoldTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface SessionStatsTabProps {
  sessionStats: SessionStats;
  isLoading?: boolean;
}

export function SessionStatsTab({ sessionStats, isLoading }: SessionStatsTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // First, find the active set if it exists
  const activeSet = sessionStats.sets.find(set => set.isActive);

  // Then get the remaining sets and sort them in descending order by ID
  const remainingSets = sessionStats.sets
    .filter(set => !set.isActive)
    .sort((a, b) => b.id - a.id);

  // Combine active set (if exists) with sorted remaining sets
  const sortedSets = activeSet
    ? [activeSet, ...remainingSets]
    : remainingSets;

  return (
    <div className="space-y-6">
      {/* Live Set Display */}
      <ScrollArea className="h-[200px] rounded-lg border border-border/50 bg-white/5">
        <div className="p-4 space-y-4">
          {sortedSets.map((set, index) => {
            const setNumber = sortedSets.length - index;
            return (
              <div
                key={set.id}
                className={`p-3 rounded-lg bg-white/5 backdrop-blur-sm space-y-2 ${
                  set.isActive ? 'ring-1 ring-primary/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Set {setNumber} - {set.pattern}</span>
                  {set.isActive && (
                    <span className="text-xs text-primary-foreground/70 animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs mb-1">Breaths</span>
                    <span className="font-medium">{set.breathCount}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs mb-1">Holds</span>
                    <span className="font-medium">{set.holdCount}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs mb-1">Avg</span>
                    <span className="font-medium">{formatHoldTime(set.avgHoldTime)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs mb-1">Best</span>
                    <span className="font-medium">{formatHoldTime(set.longestHold)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Session Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Total Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(sessionStats.totalBreathTime)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Avg Hold Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatHoldTime(sessionStats.totalHoldTime / (sessionStats.totalHoldCount || 1))}
          </p>
        </div>
      </div>
    </div>
  );
}