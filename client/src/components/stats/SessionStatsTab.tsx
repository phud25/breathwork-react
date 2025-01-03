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
  avgHoldTime: number;
  longestHold: number;
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
      <ScrollArea className="h-[300px] rounded-lg border border-border/50">
        <div className="p-4 space-y-4">
          {sortedSets.map((set, index) => {
            const setNumber = sortedSets.length - index;
            return (
              <Card
                key={set.id}
                className={`overflow-hidden bg-white/5 backdrop-blur-sm transition-all relative ${
                  set.isActive ? 'ring-1 ring-purple-500/30' : ''
                }`}
              >
                {set.isActive && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span className="text-xs font-medium text-purple-300">Active</span>
                  </div>
                )}

                {/* Pattern Header */}
                <div className="px-4 py-3 border-b border-border/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Set {setNumber}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm font-medium">{set.pattern}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-5 gap-4 p-4">
                  {/* Breaths */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Breaths</span>
                    <span className="text-sm font-semibold">{set.breathCount}</span>
                  </div>

                  {/* Breath Time */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Time</span>
                    <span className="text-sm font-semibold">{formatTime(set.breathTime || 0)}</span>
                  </div>

                  {/* Holds */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Holds</span>
                    <span className="text-sm font-semibold">{set.holdCount}</span>
                  </div>

                  {/* Avg Hold */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Avg Hold</span>
                    <span className="text-sm font-semibold">{formatTime(set.avgHoldTime)}</span>
                  </div>

                  {/* Best Hold */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Best Hold</span>
                    <span className="text-sm font-semibold">{formatTime(set.longestHold)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Session Totals Card */}
      <Card className="bg-purple-600/10 backdrop-blur-sm border-purple-500/20">
        <div className="grid grid-cols-5 gap-4 p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Breaths</p>
            <p className="text-lg font-bold tracking-tight">
              {sessionStats.totalBreaths}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Time</p>
            <p className="text-lg font-bold tracking-tight">
              {formatTime(sessionStats.totalBreathTime)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Holds</p>
            <p className="text-lg font-bold tracking-tight">
              {sessionStats.totalHoldCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Avg Hold</p>
            <p className="text-lg font-bold tracking-tight">
              {formatTime(sessionStats.avgHoldTime)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1">Best Hold</p>
            <p className="text-lg font-bold tracking-tight">
              {formatTime(sessionStats.longestHold)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}