import { useState, useCallback, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BreathingGuide } from "@/components/BreathingGuide";
import { ProgressChart } from "@/components/ProgressChart";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import { useBreathing } from "@/hooks/use-breathing";
import { useSessionStats } from "@/hooks/use-sessions";
import { Loader2 } from "lucide-react";
import { SetStatsTab } from "@/components/stats/SetStatsTab";
import { SessionStatsTab } from "@/components/stats/SessionStatsTab";
import { DailyStatsTab } from "@/components/stats/DailyStatsTab";
import { WeeklyStatsTab } from "@/components/stats/WeeklyStatsTab";
import { PatternSelector } from "@/components/PatternSelector";

type PatternType = "478" | "box" | "22" | "555" | "24ha" | "fire";

const breathingPatterns: Record<PatternType, { name: string; sequence: number[] }> = {
  "478": { name: "4-7-8 Relaxation", sequence: [4, 7, 8] },
  "box": { name: "Box Breathing (4x4)", sequence: [4, 4, 4, 4] },
  "22": { name: "2-2 Energized Focus", sequence: [2, 2] },
  "555": { name: "5-5-5 Triangle", sequence: [5, 5, 5] },
  "24ha": { name: "2-4 Ha Breath", sequence: [2, 4] },
  "fire": { name: "Breath of Fire", sequence: [0.5, 0.5] },
};

interface BreathingSet {
  id: number;
  pattern: string;
  breathCount: number;
  holdCount: number;
  avgHoldTime: number;
  longestHold: number;
  isActive: boolean;
  breathTime?: number;
}

const scrollToTabs = () => {
  const tabsElement = document.querySelector('.tabs-container');
  if (tabsElement) {
    setTimeout(() => {
      tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
};

export default function BreathPage() {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>("22");
  const [selectedDuration, setSelectedDuration] = useState(180);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { data: stats, isLoading: isLoadingStats } = useSessionStats();
  const [activeStatsTab, setActiveStatsTab] = useState<"set" | "session" | "daily" | "weekly">("set");
  const [currentSetId, setCurrentSetId] = useState(1);
  const [sets, setSets] = useState<BreathingSet[]>([]);

  const {
    isActive,
    isPaused,
    currentPhase,
    currentCycle,
    elapsedTime,
    countdown,
    sessionCompleted,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    holdStats,
    startHold,
    endHold,
  } = useBreathing(breathingPatterns[selectedPattern].sequence);

  // Reset session when navigating away and back
  useEffect(() => {
    return () => {
      setSets([]);
      setCurrentSetId(1);
    };
  }, []);

  const handlePatternChange = useCallback((value: PatternType) => {
    if (isActive) {
      const currentSet = sets.find(set => set.isActive);
      if (currentSet) {
        setSets(prev => prev.map(set =>
          set.id === currentSet.id ? { ...set, isActive: false, breathTime: elapsedTime } : set
        ));
      }
      endSession();
    }
    setSelectedPattern(value);
    setCurrentSetId(prev => prev + 1);
  }, [isActive, endSession, sets, elapsedTime]);

  const handleDurationChange = useCallback((duration: number) => {
    setSelectedDuration(duration);
  }, []);

  const handleStartSession = useCallback(() => {
    const newSet: BreathingSet = {
      id: currentSetId,
      pattern: breathingPatterns[selectedPattern].name,
      breathCount: 0,
      holdCount: 0,
      avgHoldTime: 0,
      longestHold: 0,
      isActive: true
    };
    setSets(prev => [...prev, newSet]);
    startSession();
  }, [currentSetId, selectedPattern, startSession]);

  const handleEndSession = useCallback(() => {
    // Add logging to verify hold stats
    console.log('Current hold stats:', holdStats);
    console.log('Current sets:', sets);

    setSets(prev => prev.map(set =>
      set.isActive ? {
        ...set,
        breathCount: currentCycle * breathingPatterns[selectedPattern].sequence.length + (currentPhase > 0 ? currentPhase : 0),
        holdCount: holdStats.holdCount,
        avgHoldTime: holdStats.holdCount > 0 ? Math.round(holdStats.totalHoldTime / holdStats.holdCount) : 0,
        longestHold: holdStats.longestHold,
        isActive: false,
        breathTime: elapsedTime,
      } : set
    ));

    console.log('Ending session with stats:', {
      pattern: breathingPatterns[selectedPattern].name,
      duration: elapsedTime,
      breathCount: currentCycle * breathingPatterns[selectedPattern].sequence.length + currentPhase,
      holdCount: holdStats.holdCount,
      totalHoldTime: holdStats.totalHoldTime,
      longestHold: holdStats.longestHold
    });

    endSession();
    setCurrentSetId(prev => prev + 1);
  }, [currentCycle, currentPhase, selectedPattern, holdStats, endSession, elapsedTime]);

  const handleHoldComplete = (holdDuration: number) => {
    console.log('Hold completed with duration:', holdDuration);
    // Update the current set's hold metrics
    setSets(prev => prev.map(set =>
      set.isActive ? {
        ...set,
        holdCount: holdStats.holdCount,
        avgHoldTime: holdStats.holdCount > 0 ? Math.round(holdStats.totalHoldTime / holdStats.holdCount) : 0,
        longestHold: holdStats.longestHold,
      } : set
    ));
  };

  const handleToggleZen = () => {
    setIsZenMode(prev => !prev);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  // Current stats for the SetStatsTab
  const currentStats = {
    breathCount: currentCycle * breathingPatterns[selectedPattern].sequence.length + (currentPhase > 0 ? currentPhase : 0),
    breathTime: elapsedTime,
    holdCount: holdStats.holdCount,
    avgHoldTime: holdStats.holdCount > 0 ? Math.round(holdStats.totalHoldTime / holdStats.holdCount) : 0,
    bestHoldTime: holdStats.longestHold
  };

  // Calculate session totals with combined breath time from all sets
  const sessionStats = {
    sets: sets.map(set => ({
      ...set,
      // If it's the active set, use current hold stats
      holdCount: set.isActive ? holdStats.holdCount : set.holdCount,
      avgHoldTime: set.isActive && holdStats.holdCount > 0
        ? Math.round(holdStats.totalHoldTime / holdStats.holdCount)
        : set.avgHoldTime,
      longestHold: set.isActive ? holdStats.longestHold : set.longestHold
    })),
    totalBreaths: sets.reduce((total, set) => total + set.breathCount, 0) + currentStats.breathCount,
    totalHoldCount: sets.reduce((total, set) => total + set.holdCount, 0) + holdStats.holdCount,
    totalBreathTime: sets.reduce((total, set) => total + (set.breathTime || 0), 0) + elapsedTime,
    totalHoldTime: sets.reduce((total, set) =>
      total + (set.holdCount * set.avgHoldTime), 0) + holdStats.totalHoldTime,
    avgHoldTime: 0,
    longestHold: Math.max(
      ...sets.map(set => set.longestHold),
      holdStats.longestHold
    )
  };

  // Calculate average hold time for the entire session
  if (sessionStats.totalHoldCount > 0) {
    sessionStats.avgHoldTime = Math.round(sessionStats.totalHoldTime / sessionStats.totalHoldCount);
  }

  // Calculate daily stats including current session
  const dailyStats = {
    totalSessions: (stats?.totalSessions || 0) + 1,
    setsPerSession: ((stats?.totalSets || 0) + sets.length) / ((stats?.totalSessions || 0) + 1),
    breathTime: (stats?.totalMinutes || 0) * 60 + elapsedTime,
    holdDuration: (stats?.totalHoldTime || 0) + sessionStats.totalHoldTime,
    longestSession: Math.max((stats?.longestSession || 0), elapsedTime),
    peakMetrics: {
      longestHold: Math.max(stats?.longestHold || 0, sessionStats.longestHold),
      highestConsistency: 98,
    },
  };

  // Stats for WeeklyStatsTab
  const weeklyStats = {
    activeDays: stats?.currentStreak || 0,
    totalSessions: (stats?.totalSessions || 0) + 1,
    totalBreathTime: (stats?.totalMinutes || 0) * 60 + elapsedTime,
    patternVariety: 4,
    dailySummaries: [{
      date: new Date(),
      sessions: 1,
      breathTime: elapsedTime,
      patterns: [breathingPatterns[selectedPattern].name],
      holdCount: holdStats.holdCount,
      avgHoldTime: holdStats.holdCount > 0 ? Math.round(holdStats.totalHoldTime / holdStats.holdCount) : 0,
      longestHold: holdStats.longestHold
    }],
  };

  return (
    <div className={cn(
      "relative w-full max-w-[100vw] overflow-x-hidden",
      isZenMode && "h-screen bg-background/95 backdrop-blur-sm"
    )}>
      {!isZenMode && <Navigation />}
      <main className={cn(
        "min-h-screen transition-all duration-500",
        !isZenMode && "pt-[30px] px-4 pb-8",
        isZenMode && "flex items-center justify-center"
      )}>
        <div className={cn(
          "container max-w-4xl mx-auto space-y-5 transition-all duration-500",
          isZenMode && "opacity-0 pointer-events-none absolute"
        )}>
          <div className="grid md:grid-cols-2 gap-6">
            <ErrorBoundary>
              <Card className="session-container bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20 -mt-[5px]">
                <CardContent className="p-0">
                  <PatternSelector
                    selectedPattern={selectedPattern}
                    onPatternChange={handlePatternChange}
                    selectedDuration={selectedDuration}
                    onDurationChange={handleDurationChange}
                  />
                  <div className="p-4 md:p-6">
                    <BreathingGuide
                      pattern={breathingPatterns[selectedPattern]}
                      isActive={isActive}
                      isPaused={isPaused}
                      currentPhase={currentPhase}
                      isZenMode={isZenMode}
                      isSoundEnabled={isSoundEnabled}
                      elapsed={elapsedTime}
                      breathCount={currentStats.breathCount}
                      countdown={countdown}
                      sessionCompleted={sessionCompleted}
                      onStart={handleStartSession}
                      onPause={pauseSession}
                      onResume={resumeSession}
                      onStop={handleEndSession}
                      onToggleZen={handleToggleZen}
                      onToggleSound={handleToggleSound}
                      onPatternChange={handlePatternChange}
                      onHoldComplete={handleHoldComplete}
                    />
                  </div>
                </CardContent>
              </Card>
            </ErrorBoundary>

            <Card className={cn(
              "bg-gradient-to-br from-purple-600/10 to-purple-800/5 backdrop-blur-sm shadow-inner border-purple-500/20",
              "non-essential transition-opacity duration-300",
              isZenMode && "opacity-0 pointer-events-none"
            )}>
              <CardContent className="p-4 md:p-6">
                <Tabs value={activeStatsTab} onValueChange={(value) => {
                  // Always scroll, even if it's the same tab as currently selected
                  scrollToTabs();
                  setActiveStatsTab(value as typeof activeStatsTab);
                }} className="tabs-container">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger
                      value="set"
                      className="data-[state=active]:bg-[#121212] data-[state=active]:text-[#F5F5DC] transition-colors"
                    >
                      Set
                    </TabsTrigger>
                    <TabsTrigger
                      value="session"
                      className="data-[state=active]:bg-[#121212] data-[state=active]:text-[#F5F5DC] transition-colors"
                    >
                      Session
                    </TabsTrigger>
                    <TabsTrigger
                      value="daily"
                      className="data-[state=active]:bg-[#121212] data-[state=active]:text-[#F5F5DC] transition-colors"
                    >
                      Daily
                    </TabsTrigger>
                    <TabsTrigger
                      value="weekly"
                      className="data-[state=active]:bg-[#121212] data-[state=active]:text-[#F5F5DC] transition-colors"
                    >
                      Weekly
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="set" className="mt-0">
                    <SetStatsTab
                      currentStats={currentStats}
                      isLoading={isLoadingStats}
                    />
                  </TabsContent>

                  <TabsContent value="session" className="mt-0">
                    <SessionStatsTab
                      sessionStats={sessionStats}
                      isLoading={isLoadingStats}
                    />
                  </TabsContent>

                  <TabsContent value="daily" className="mt-0">
                    <DailyStatsTab
                      dailyStats={dailyStats}
                      isLoading={isLoadingStats}
                    />
                  </TabsContent>

                  <TabsContent value="weekly" className="mt-0">
                    <WeeklyStatsTab
                      weeklyStats={weeklyStats}
                      isLoading={isLoadingStats}
                    />
                  </TabsContent>
                </Tabs>
                <div className="mt-8">
                  <ProgressChart />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isZenMode && (
          <div className="fixed inset-0 flex flex-col items-center justify-center">
            <div className="scale-120 mb-8">
              <BreathingGuide
                pattern={breathingPatterns[selectedPattern]}
                isActive={isActive}
                isPaused={isPaused}
                currentPhase={currentPhase}
                isZenMode={isZenMode}
                isSoundEnabled={isSoundEnabled}
                elapsed={elapsedTime}
                breathCount={currentStats.breathCount}
                countdown={countdown}
                sessionCompleted={sessionCompleted}
                onStart={handleStartSession}
                onPause={pauseSession}
                onResume={resumeSession}
                onStop={handleEndSession}
                onToggleZen={handleToggleZen}
                onToggleSound={handleToggleSound}
                onPatternChange={handlePatternChange}
                onHoldComplete={handleHoldComplete}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}