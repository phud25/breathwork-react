import { useState, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { BreathingGuide } from "@/components/BreathingGuide";
import { ProgressChart } from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
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
    <>
      <Navigation />
      <main className={cn(
        "min-h-screen bg-background transition-all duration-500",
        isZenMode ? "p-0" : "pt-14 px-4 pb-8"
      )}>
        <div className={cn(
          "container max-w-4xl mx-auto space-y-5",
          isZenMode && "hidden"
        )}>
          <div className="grid md:grid-cols-2 gap-6">
            <ErrorBoundary>
              <Card>
                <CardContent className="py-4">
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

            <Card>
              <CardContent className="py-4">
                <Tabs defaultValue="session" value={activeTab} onValueChange={(value) => setActiveTab(value as "session" | "daily")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="session">Session Tracker</TabsTrigger>
                    <TabsTrigger value="daily">Daily Tracker</TabsTrigger>
                  </TabsList>

                  <TabsContent value="session" className="mt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Breaths</p>
                        <p className="text-2xl font-bold">{sessionBreaths}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="text-2xl font-bold">
                          {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Holds</p>
                        <p className="text-2xl font-bold">{holdStats.holdCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hold Time</p>
                        <p className="text-2xl font-bold">
                          {Math.floor(holdStats.totalHoldTime / 60)}:{(holdStats.totalHoldTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Hold</p>
                        <p className="text-2xl font-bold">
                          {Math.floor(sessionAvgHold / 60)}:{(sessionAvgHold % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="daily" className="mt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Breaths</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <p className="text-2xl font-bold">{totalBreaths}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <p className="text-2xl font-bold">
                            {totalMinutes}:00
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div>
                        <p className="text-sm text-muted-foreground">Holds</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <p className="text-2xl font-bold">{totalHolds}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hold Time</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <p className="text-2xl font-bold">
                            {Math.floor(totalHoldTime / 60)}:{(totalHoldTime % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Hold</p>
                        {isLoadingStats ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <p className="text-2xl font-bold">
                            {Math.floor(dailyAvgHold / 60)}:{(dailyAvgHold % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <ProgressChart />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}