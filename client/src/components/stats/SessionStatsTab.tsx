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

  return (
    <div className="space-y-6">
      {/* Live Set Display */}
      <ScrollArea className="h-[200px] rounded-lg border border-border/50 bg-white/5">
        <div className="p-4 space-y-4">
          {sessionStats.sets.map((set) => (
            <div
              key={set.id}
              className="p-3 rounded-lg bg-white/5 backdrop-blur-sm space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Set {set.id} - {set.pattern}</span>
                <span className="text-sm text-muted-foreground">
                  {set.breathCount} breaths
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Holds: </span>
                  <span>{set.holdCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg: </span>
                  <span>
                    {Math.floor(set.avgHoldTime / 60)}:
                    {(set.avgHoldTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Best: </span>
                  <span>
                    {Math.floor(set.longestHold / 60)}:
                    {(set.longestHold % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              {set.isActive && (
                <div className="text-xs text-primary-foreground/70 animate-pulse">
                  Active Set
                </div>
              )}
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
            {Math.floor(sessionStats.totalBreathTime / 60)}:
            {(sessionStats.totalBreathTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Hold Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(sessionStats.totalHoldTime / 60)}:
            {(sessionStats.totalHoldTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  );
}