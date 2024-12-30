import { useState, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { BreathingGuide } from "@/components/BreathingGuide";
import { ProgressChart } from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const breathCount = currentCycle * breathingPatterns[selectedPattern].sequence.length +
    (currentPhase > 0 ? currentPhase : 0);

  // Calculate total stats including current session
  const totalBreaths = (stats?.todayStats?.totalBreaths || 0) + breathCount;
  const totalSeconds = (stats?.todayStats?.totalMinutes || 0) * 60 + elapsedTime;
  const totalHolds = (stats?.todayStats?.totalHolds || 0) + holdStats.holdCount;
  const totalHoldTime = (stats?.todayStats?.totalHoldTime || 0) + holdStats.totalHoldTime;

  // Calculate average hold time
  const avgHoldTime = totalHolds > 0
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
                    breathCount={breathCount}
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
              "transition-opacity duration-300",
              isZenMode ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
              <CardHeader>
                <CardTitle>Daily Tracking</CardTitle>
              </CardHeader>
              <CardContent>
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
                        {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
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
                        {Math.floor(avgHoldTime / 60)}:{(avgHoldTime % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
                <ProgressChart />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}