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
}

export default function BreathPage() {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>("22");
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
    recordHold,
    holdStats
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
          set.id === currentSet.id ? { ...set, isActive: false } : set
        ));
      }
      endSession();
    }
    setSelectedPattern(value);
    setCurrentSetId(prev => prev + 1);
  }, [isActive, endSession, sets]);

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
    setSets(prev => prev.map(set =>
      set.isActive ? {
        ...set,
        breathCount: currentCycle * breathingPatterns[selectedPattern].sequence.length + (currentPhase > 0 ? currentPhase : 0),
        holdCount: holdStats.holdCount,
        avgHoldTime: holdStats.holdCount > 0 ? Math.round(holdStats.totalHoldTime / holdStats.holdCount) : 0,
        longestHold: holdStats.longestHold,
        isActive: false
      } : set
    ));
    endSession();
    setCurrentSetId(prev => prev + 1);
  }, [currentCycle, currentPhase, selectedPattern, holdStats, endSession]);

  const handleHoldComplete = (holdDuration: number) => {
    recordHold(holdDuration);
  };

  const handleToggleZen = () => {
    setIsZenMode(prev => !prev);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  // Calculate current stats for the SetStatsTab
  const currentStats = {
    breathCount: currentCycle * breathingPatterns[selectedPattern].sequence.length + (currentPhase > 0 ? currentPhase : 0),
    breathTime: elapsedTime,
    holdCount: holdStats.holdCount,
    avgHoldTime: holdStats.holdCount > 0 ? Math.round(holdStats.totalHoldTime / holdStats.holdCount) : 0,
    bestHoldTime: holdStats.longestHold
  };

  // Calculate session totals
  const sessionStats = {
    sets,
    totalBreaths: sets.reduce((total, set) => total + set.breathCount, 0) + currentStats.breathCount,
    totalHoldCount: sets.reduce((total, set) => total + set.holdCount, 0) + currentStats.holdCount,
    totalBreathTime: elapsedTime,
    totalHoldTime: holdStats.totalHoldTime
  };


  // Calculate daily stats including current session
  const totalBreaths = (stats?.todayStats?.totalBreaths || 0) + sessionStats.totalBreaths;
  const totalMinutes = (stats?.todayStats?.totalMinutes || 0) + Math.floor(elapsedTime / 60);
  const totalHolds = (stats?.todayStats?.totalHolds || 0) + sessionStats.totalHoldCount;
  const totalHoldTime = (stats?.todayStats?.totalHoldTime || 0) + holdStats.totalHoldTime;
  const dailyAvgHold = totalHolds > 0
    ? Math.round(totalHoldTime / totalHolds)
    : 0;

  // Stats for DailyStatsTab
  const dailyStats = {
    totalSessions: stats?.todayStats?.totalSessions || 0 + 1, //add current session
    setsPerSession: ((stats?.todayStats?.totalSets || 0) + sets.length) / (stats?.todayStats?.totalSessions || 1 + 1), //add current session
    breathTime: (stats?.todayStats?.totalMinutes || 0) * 60 + elapsedTime,
    holdDuration: (stats?.todayStats?.totalHoldTime || 0) + holdStats.totalHoldTime,
    mostUsedPattern: "4-7-8 Relaxation", // TODO: Implement tracking
    bestPerformance: {
      pattern: "Box Breathing",
      score: 98,
    },
    longestSession: (stats?.todayStats?.longestSession || 0) * 60 + elapsedTime, //add current session
    peakMetrics: {
      longestHold: stats?.todayStats?.longestHold || 0 > holdStats.longestHold ? stats?.todayStats?.longestHold || 0 : holdStats.longestHold,
      highestConsistency: 98,
    },
  };

  // Stats for WeeklyStatsTab
  const weeklyStats = {
    activeDays: stats?.currentStreak || 0,
    totalSessions: stats?.weeklyStats?.totalSessions || 0 + 1, //add current session
    totalBreathTime: (stats?.weeklyStats?.totalMinutes || 0) * 60 + elapsedTime,
    patternVariety: 4, // TODO: Implement tracking
    dailySummaries: [], // TODO: Implement tracking
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
              <Card className="session-container bg-gradient-to-br from-purple-600/30 to-purple-800/20 backdrop-blur-sm shadow-lg shadow-purple-900/20 border-purple-500/30 -mt-[5px]">
                <CardContent className="p-4 md:p-6">
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
                </CardContent>
              </Card>
            </ErrorBoundary>

            <Card className={cn(
              "bg-gradient-to-br from-purple-600/20 to-purple-800/15 hover:from-purple-600/30 hover:to-purple-800/25 backdrop-blur-sm shadow-inner border-purple-500/30",
              "non-essential transition-opacity duration-300",
              isZenMode && "opacity-0 pointer-events-none"
            )}>
              <CardContent className="p-4 md:p-6">
                <Tabs
                  defaultValue="set"
                  value={activeStatsTab}
                  onValueChange={(value) => {
                    setActiveStatsTab(value as typeof activeStatsTab);
                    // Add smooth scroll to tabs
                    const element = document.querySelector('[role="tablist"]');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger
                      value="set"
                      className="data-[state=active]:bg-[#050505] data-[state=active]:text-[#F5F5DC]"
                    >
                      Set
                    </TabsTrigger>
                    <TabsTrigger
                      value="session"
                      className="data-[state=active]:bg-[#050505] data-[state=active]:text-[#F5F5DC]"
                    >
                      Session
                    </TabsTrigger>
                    <TabsTrigger
                      value="daily"
                      className="data-[state=active]:bg-[#050505] data-[state=active]:text-[#F5F5DC]"
                    >
                      Daily
                    </TabsTrigger>
                    <TabsTrigger
                      value="weekly"
                      className="data-[state=active]:bg-[#050505] data-[state=active]:text-[#F5F5DC]"
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