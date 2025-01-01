import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SetStatsProps {
  currentStats: {
    breathCount: number;
    targetBreaths: number;
    breathTime: number;
    holdCount: number;
    avgHoldTime: number;
    bestHoldTime: number;
    consistencyScore: number;
    flowStateDuration: number;
    avgCycleTime: number;
    isOnTarget: boolean;
  };
  isLoading?: boolean;
}

export function SetStatsTab({ currentStats, isLoading }: SetStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breaths</p>
          <p className="text-2xl font-bold tracking-tight">
            {currentStats.breathCount}/{currentStats.targetBreaths}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(currentStats.breathTime / 60)}:
            {(currentStats.breathTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Holds</p>
          <p className="text-2xl font-bold tracking-tight">{currentStats.holdCount}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Avg Hold</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(currentStats.avgHoldTime / 60)}:
            {(currentStats.avgHoldTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground font-medium">Best Hold</p>
          <p className="text-2xl font-bold tracking-tight">
            {Math.floor(currentStats.bestHoldTime / 60)}:
            {(currentStats.bestHoldTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Consistency</p>
            <p className="text-2xl font-bold tracking-tight">
              {currentStats.consistencyScore}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Flow State</p>
            <p className="text-2xl font-bold tracking-tight">
              {Math.floor(currentStats.flowStateDuration / 60)}:
              {(currentStats.flowStateDuration % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Avg Cycle</p>
            <p className="text-2xl font-bold tracking-tight">
              {currentStats.avgCycleTime.toFixed(1)}s
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium">Pace</p>
            <p className="text-2xl font-bold tracking-tight">
              {currentStats.isOnTarget ? "On Target" : "Adjust"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
