import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface SessionSet {
  id: number;
  pattern: string;
  breathCount: number;
  totalTime: number;
  holdTimes: number[];
}

interface SessionStats {
  currentSets: SessionSet[];
  totalSets: number;
  totalBreathTime: number;
  totalHoldTime: number;
  patternsUsed: string[];
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
          {sessionStats.currentSets.map((set) => (
            <div
              key={set.id}
              className="p-3 rounded-lg bg-white/5 backdrop-blur-sm space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{set.pattern}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(set.totalTime / 60)}:
                  {(set.totalTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>{set.breathCount} breaths</span>
                <span>{set.holdTimes.length} holds</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Session Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Sets</p>
          <p className="text-2xl font-bold tracking-tight">{sessionStats.totalSets}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(sessionStats.totalBreathTime / 60)}:
            {(sessionStats.totalBreathTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Hold Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(sessionStats.totalHoldTime / 60)}:
            {(sessionStats.totalHoldTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Patterns</p>
          <p className="text-2xl font-bold tracking-tight">
            {sessionStats.patternsUsed.length}
          </p>
        </div>
      </div>
    </div>
  );
}
