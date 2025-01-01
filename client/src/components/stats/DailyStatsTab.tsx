import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DailyStats {
  totalSessions: number;
  setsPerSession: number;
  breathTime: number;
  holdDuration: number;
  mostUsedPattern: string;
  bestPerformance: {
    pattern: string;
    score: number;
  };
  longestSession: number;
  peakMetrics: {
    longestHold: number;
    highestConsistency: number;
  };
}

interface DailyStatsTabProps {
  dailyStats: DailyStats;
  isLoading?: boolean;
}

export function DailyStatsTab({ dailyStats, isLoading }: DailyStatsTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Sessions</p>
          <p className="text-2xl font-bold tracking-tight">{dailyStats.totalSessions}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Sets/Session</p>
          <p className="text-2xl font-bold tracking-tight">{dailyStats.setsPerSession}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(dailyStats.breathTime / 60)}:
            {(dailyStats.breathTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Hold Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(dailyStats.holdDuration / 60)}:
            {(dailyStats.holdDuration % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Pattern Breakdown */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Top Pattern</p>
            <p className="text-2xl font-bold tracking-tight">
              {dailyStats.mostUsedPattern}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Best Pattern</p>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {dailyStats.bestPerformance.pattern}
              </p>
              <p className="text-sm text-muted-foreground">
                {dailyStats.bestPerformance.score}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Longest Session</p>
            <p className="text-2xl font-bold tracking-tight">
              {Math.floor(dailyStats.longestSession / 60)}:
              {(dailyStats.longestSession % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Peak Stats</p>
            <div className="space-y-1">
              <p className="text-sm">
                Hold: {Math.floor(dailyStats.peakMetrics.longestHold / 60)}:
                {(dailyStats.peakMetrics.longestHold % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm">
                Consistency: {dailyStats.peakMetrics.highestConsistency}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
