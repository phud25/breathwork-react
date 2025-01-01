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
}

interface SessionStats {
  sets: SessionSet[];
  totalBreaths: number;
  totalHoldCount: number;
  totalBreathTime: number;
  totalHoldTime: number;
}

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

  // Sort sets to show active set first, then by descending ID
  const sortedSets = [...sessionStats.sets].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.id - a.id;
  });

  return (
    <div className="space-y-6">
      {/* Live Set Display */}
      <ScrollArea className="h-[200px] rounded-lg border border-border/50 bg-white/5">
        <div className="p-4 space-y-4">
          {sortedSets.map((set) => (
            <div
              key={set.id}
              className={`p-3 rounded-lg bg-white/5 backdrop-blur-sm space-y-2 ${
                set.isActive ? 'ring-1 ring-primary/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Set {set.id} - {set.pattern}</span>
                {set.isActive && (
                  <span className="text-xs text-primary-foreground/70 animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Breaths: </span>
                  <span>{set.breathCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Holds: </span>
                  <span>{set.holdCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg: </span>
                  <span>{formatTime(set.avgHoldTime)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Best: </span>
                  <span>{formatTime(set.longestHold)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Session Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Total Breaths</p>
          <p className="text-2xl font-bold tracking-tight">{sessionStats.totalBreaths}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Total Holds</p>
          <p className="text-2xl font-bold tracking-tight">{sessionStats.totalHoldCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(sessionStats.totalBreathTime)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Avg Hold Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(sessionStats.totalHoldTime / (sessionStats.totalHoldCount || 1))}
          </p>
        </div>
      </div>
    </div>
  );
}