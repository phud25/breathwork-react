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
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const { data: stats, isLoading: isLoadingStats } = useSessionStats();
  const [activeTab, setActiveTab] = useState<"session" | "daily">("session");

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
              <Card className="session-container bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
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
                <Tabs defaultValue="session" value={activeTab} onValueChange={(value) => setActiveTab(value as "session" | "daily")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="session">Session Tracker</TabsTrigger>
                    <TabsTrigger value="daily">Daily Tracker</TabsTrigger>
                  </TabsList>

                  <TabsContent value="session" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Breaths</p>
                        <p className="text-3xl font-bold tracking-tight">{sessionBreaths}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Breath Time</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-border/50 my-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Holds</p>
                        <p className="text-3xl font-bold tracking-tight">{holdStats.holdCount}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Avg Hold</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {Math.floor(sessionAvgHold / 60)}:{(sessionAvgHold % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Best Hold</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {Math.floor(holdStats.longestHold / 60)}:{(holdStats.longestHold % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="daily" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Total Breaths</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2" />
                        ) : (
                          <p className="text-3xl font-bold tracking-tight">{totalBreaths}</p>
                        )}
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Total Minutes</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2" />
                        ) : (
                          <p className="text-3xl font-bold tracking-tight">
                            {totalMinutes}:{(0).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-px bg-border/50 my-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Total Holds</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2" />
                        ) : (
                          <p className="text-3xl font-bold tracking-tight">{totalHolds}</p>
                        )}
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Avg Hold</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2" />
                        ) : (
                          <p className="text-3xl font-bold tracking-tight">
                            {Math.floor(dailyAvgHold / 60)}:{(dailyAvgHold % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground font-medium">Best Hold</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-2" />
                        ) : (
                          <p className="text-3xl font-bold tracking-tight">
                            {Math.floor((stats?.todayStats?.longestHold || 0) / 60)}:
                            {((stats?.todayStats?.longestHold || 0) % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
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
            <div className="scale-115 mb-8">
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