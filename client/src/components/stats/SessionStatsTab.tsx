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

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const simplifyPatternName = (pattern: string) => {
  // Remove timing patterns like (2-2) and other technical details
  return pattern
    .replace(/\(\d+x?\d*\)/g, '')  // Remove (4x4) or (2-2)
    .replace(/\d+-\d+-\d+|\d+-\d+/g, '') // Remove patterns like 4-7-8 or 2-2
    .trim();
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
      {/* Session Sets Table */}
      <ScrollArea className="h-[200px] rounded-lg border border-purple-500/20 bg-white/5">
        <div className="min-w-full table">
          {/* Header Row */}
          <div className="table-header-group text-xs font-medium text-muted-foreground">
            <div className="table-row border-b border-purple-500/20">
              <div className="table-cell p-2 text-left whitespace-nowrap">Set · Pattern</div>
              <div className="table-cell p-2 text-right">Breaths</div>
              <div className="table-cell p-2 text-right">Time</div>
              <div className="table-cell p-2 text-right">Holds</div>
              <div className="table-cell p-2 text-right">Avg Hold</div>
              <div className="table-cell p-2 text-right">Best Hold</div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="table-row-group">
            {sortedSets.map((set, index) => {
              const setNumber = sortedSets.length - index;
              const simplifiedPattern = simplifyPatternName(set.pattern);
              return (
                <div
                  key={set.id}
                  className={`table-row border-b border-purple-500/10 text-sm transition-colors ${
                    set.isActive ? 'bg-purple-500/5' : ''
                  }`}
                >
                  <div className="table-cell p-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-right min-w-[20px]">{setNumber}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="flex-1">{simplifiedPattern}</span>
                      {set.isActive && (
                        <span className="text-xs text-primary-foreground/70 animate-pulse ml-2">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="table-cell p-2 text-right">
                    {set.breathCount}
                  </div>
                  <div className="table-cell p-2 text-right">
                    {formatTime(set.breathTime || 0)}
                  </div>
                  <div className="table-cell p-2 text-right">
                    {set.holdCount}
                  </div>
                  <div className="table-cell p-2 text-right">
                    {formatTime(set.avgHoldTime)}
                  </div>
                  <div className="table-cell p-2 text-right">
                    {formatTime(set.longestHold)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Session Totals */}
      <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm">
        <div className="min-w-full table">
          <div className="table-row-group">
            <div className="table-row text-sm font-medium">
              <div className="table-cell p-3 text-left">Totals</div>
              <div className="table-cell p-3 text-right">{sessionStats.totalBreaths}</div>
              <div className="table-cell p-3 text-right">{formatTime(sessionStats.totalBreathTime)}</div>
              <div className="table-cell p-3 text-right">{sessionStats.totalHoldCount}</div>
              <div className="table-cell p-3 text-right">
                {formatTime(
                  sessionStats.totalHoldCount > 0
                    ? Math.round(sessionStats.totalHoldTime / sessionStats.totalHoldCount)
                    : 0
                )}
              </div>
              <div className="table-cell p-3 text-right">
                {formatTime(Math.max(...sessionStats.sets.map(set => set.longestHold)))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}