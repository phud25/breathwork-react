import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DailyStats {
  totalSessions: number;
  setsPerSession: number;
  breathTime: number;
  holdDuration: number;
  longestSession: number;
  peakMetrics: {
    longestHold: number;
    highestConsistency: number;
  };
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
          <p className="text-2xl font-bold tracking-tight">{dailyStats.setsPerSession.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(dailyStats.breathTime)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Hold Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(dailyStats.holdDuration)}
          </p>
        </div>
      </div>

      {/* Pattern Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Longest Session</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(dailyStats.longestSession)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Peak Stats</p>
          <div className="space-y-1">
            <p className="text-sm">
              Hold: {formatTime(dailyStats.peakMetrics.longestHold)}
            </p>
            <p className="text-sm">
              Consistency: {dailyStats.peakMetrics.highestConsistency}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}