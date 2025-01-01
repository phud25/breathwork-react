import { useState, useCallback } from "react";
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

export default function BreathPage() {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>("22");
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { data: stats, isLoading: isLoadingStats } = useSessionStats();
  const [activeTab, setActiveTab] = useState<"session" | "daily">("session");
  const [activeStatsTab, setActiveStatsTab] = useState<"set" | "session" | "daily" | "weekly">("set");

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

  const handlePatternChange = useCallback((value: PatternType) => {
    if (isActive) {
      endSession();
    }
    setSelectedPattern(value);
  }, [isActive, endSession]);

  const handleHoldComplete = (holdDuration: number) => {
    recordHold(holdDuration);
  };

  const handleToggleZen = () => {
    setIsZenMode(prev => !prev);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  // Calculate session stats
  const sessionBreaths = currentCycle * breathingPatterns[selectedPattern].sequence.length +
    (currentPhase > 0 ? currentPhase : 0);
  const sessionAvgHold = holdStats.holdCount > 0
    ? Math.round(holdStats.totalHoldTime / holdStats.holdCount)
    : 0;

  // Calculate daily stats including current session
  const totalBreaths = (stats?.todayStats?.totalBreaths || 0) + sessionBreaths;
  const totalMinutes = (stats?.todayStats?.totalMinutes || 0) + Math.floor(elapsedTime / 60);
  const totalHolds = (stats?.todayStats?.totalHolds || 0) + holdStats.holdCount;
  const totalHoldTime = (stats?.todayStats?.totalHoldTime || 0) + holdStats.totalHoldTime;
  const dailyAvgHold = totalHolds > 0
    ? Math.round(totalHoldTime / totalHolds)
    : 0;

  // Calculate current stats for the SetStatsTab
  const currentStats = {
    breathCount: sessionBreaths,
    targetBreaths: 0, // TODO: Implement calculation
    breathTime: elapsedTime,
    holdCount: holdStats.holdCount,
    avgHoldTime: sessionAvgHold,
    bestHoldTime: holdStats.longestHold,
    consistencyScore: 95, // TODO: Implement calculation
    flowStateDuration: elapsedTime, // TODO: Implement calculation
    avgCycleTime: 4.5, // TODO: Implement calculation
    isOnTarget: true, // TODO: Implement calculation
  };

  // Session stats for SessionStatsTab
  const sessionStats = {
    currentSets: [], // TODO: Implement tracking
    totalSets: currentCycle + 1,
    totalBreathTime: elapsedTime,
    totalHoldTime: holdStats.totalHoldTime,
    patternsUsed: [breathingPatterns[selectedPattern].name],
  };

  // Stats for DailyStatsTab
  const dailyStats = {
    totalSessions: stats?.todayStats?.totalSessions || 0,
    setsPerSession: (stats?.todayStats?.totalSets || 0) / (stats?.todayStats?.totalSessions || 1),
    breathTime: (stats?.todayStats?.totalMinutes || 0) * 60,
    holdDuration: stats?.todayStats?.totalHoldTime || 0,
    mostUsedPattern: "4-7-8 Relaxation", // TODO: Implement tracking
    bestPerformance: {
      pattern: "Box Breathing",
      score: 98,
    },
    longestSession: (stats?.todayStats?.longestSession || 0) * 60,
    peakMetrics: {
      longestHold: stats?.todayStats?.longestHold || 0,
      highestConsistency: 98,
    },
  };

  // Stats for WeeklyStatsTab
  const weeklyStats = {
    activeDays: stats?.currentStreak || 0,
    totalSessions: stats?.weeklyStats?.totalSessions || 0,
    totalBreathTime: (stats?.weeklyStats?.totalMinutes || 0) * 60,
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
              <Card className="session-container bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20 -mt-[5px]">
                <CardContent className="p-4 md:p-6">
                  <BreathingGuide
                    pattern={breathingPatterns[selectedPattern]}
                    isActive={isActive}
                    isPaused={isPaused}
                    currentPhase={currentPhase}
                    isZenMode={isZenMode}
                    isSoundEnabled={isSoundEnabled}
                    elapsed={elapsedTime}
                    breathCount={sessionBreaths}
                    countdown={countdown}
                    sessionCompleted={sessionCompleted}
                    onStart={startSession}
                    onPause={pauseSession}
                    onResume={resumeSession}
                    onStop={endSession}
                    onToggleZen={handleToggleZen}
                    onToggleSound={handleToggleSound}
                    onPatternChange={handlePatternChange}
                    onHoldComplete={handleHoldComplete}
                  />
                </CardContent>
              </Card>
            </ErrorBoundary>

            <Card className={cn(
              "bg-gradient-to-br from-purple-600/10 to-purple-800/5 backdrop-blur-sm shadow-inner border-purple-500/20",
              "non-essential transition-opacity duration-300",
              isZenMode && "opacity-0 pointer-events-none"
            )}>
              <CardContent className="p-4 md:p-6">
                <Tabs defaultValue="set" value={activeStatsTab} onValueChange={(value) => setActiveStatsTab(value as typeof activeStatsTab)}>
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
                breathCount={sessionBreaths}
                countdown={countdown}
                sessionCompleted={sessionCompleted}
                onStart={startSession}
                onPause={pauseSession}
                onResume={resumeSession}
                onStop={endSession}
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