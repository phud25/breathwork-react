import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="space-y-4">
      {/* Session Sets Table */}
      <ScrollArea className="h-[220px] rounded-lg border border-purple-500/20 bg-white/5">
        <div className="min-w-full table">
          {/* Header Row */}
          <div className="table-header-group text-xs font-medium sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="table-row border-b border-purple-500/20">
              <div className="table-cell p-3 text-left">Set & Pattern</div>
              <div className="table-cell p-3 text-right">Breaths</div>
              <div className="table-cell p-3 text-right">Time</div>
              <div className="table-cell p-3 text-right">Holds</div>
              <div className="table-cell p-3 text-right">Avg Hold</div>
              <div className="table-cell p-3 text-right">Best Hold</div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="table-row-group">
            <AnimatePresence>
              {sortedSets.map((set, index) => {
                const setNumber = sortedSets.length - index;
                return (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`table-row border-b border-purple-500/10 text-sm transition-colors ${
                      set.isActive ? 'bg-purple-500/10' : 'hover:bg-purple-500/5'
                    }`}
                  >
                    <div className="table-cell p-3 font-medium">
                      Set {setNumber} - {set.pattern}
                      {set.isActive && (
                        <span className="ml-2 text-xs text-purple-300 animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="table-cell p-3 text-right font-mono">{set.breathCount}</div>
                    <div className="table-cell p-3 text-right font-mono">{formatTime(set.breathTime || 0)}</div>
                    <div className="table-cell p-3 text-right font-mono">{set.holdCount}</div>
                    <div className="table-cell p-3 text-right font-mono">{formatTime(set.avgHoldTime)}</div>
                    <div className="table-cell p-3 text-right font-mono">{formatTime(set.longestHold)}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      {/* Session Totals */}
      <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 shadow-inner">
        <div className="min-w-full table">
          <div className="table-row-group">
            <div className="table-row text-sm font-medium">
              <div className="table-cell p-3 text-left">Session Totals</div>
              <div className="table-cell p-3 text-right font-mono">{sessionStats.totalBreaths}</div>
              <div className="table-cell p-3 text-right font-mono">{formatTime(sessionStats.totalBreathTime)}</div>
              <div className="table-cell p-3 text-right font-mono">{sessionStats.totalHoldCount}</div>
              <div className="table-cell p-3 text-right font-mono">
                {formatTime(
                  sessionStats.totalHoldCount > 0
                    ? Math.round(sessionStats.totalHoldTime / sessionStats.totalHoldCount)
                    : 0
                )}
              </div>
              <div className="table-cell p-3 text-right font-mono">
                {formatTime(Math.max(...sessionStats.sets.map(set => set.longestHold)))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}