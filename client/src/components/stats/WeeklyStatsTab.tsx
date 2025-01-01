import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface DailySummary {
  date: Date;
  sessions: number;
  breathTime: number;
  patterns: string[];
}

interface WeeklyStats {
  activeDays: number;
  totalSessions: number;
  totalBreathTime: number;
  patternVariety: number;
  dailySummaries: DailySummary[];
}

interface WeeklyStatsTabProps {
  weeklyStats: WeeklyStats;
  isLoading?: boolean;
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

export function WeeklyStatsTab({ weeklyStats, isLoading }: WeeklyStatsTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedSummary = weeklyStats.dailySummaries.find(
    (summary) => summary.date.toDateString() === selectedDate?.toDateString()
  );

  return (
    <div className="space-y-6">
      {/* Weekly Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Active Days</p>
          <p className="text-2xl font-bold tracking-tight">{weeklyStats.activeDays}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Sessions</p>
          <p className="text-2xl font-bold tracking-tight">{weeklyStats.totalSessions}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {formatTime(weeklyStats.totalBreathTime)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Patterns</p>
          <p className="text-2xl font-bold tracking-tight">{weeklyStats.patternVariety}</p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="rounded-lg border border-border/50 bg-white/5 p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
        />

        {/* Selected Day Summary */}
        {selectedSummary && (
          <div className="mt-4 space-y-3">
            <p className="font-medium">
              {selectedSummary.date.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Sessions</p>
                <p className="font-medium">{selectedSummary.sessions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Breath Time</p>
                <p className="font-medium">{formatTime(selectedSummary.breathTime)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patterns Used</p>
              <p className="text-sm font-medium">
                {selectedSummary.patterns.join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}