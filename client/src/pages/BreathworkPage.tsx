import { useState, useCallback } from "react";
import { BreathingGuide } from "@/components/BreathingGuide";
import { ProgressChart } from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useUser } from "@/hooks/use-user";
import { useBreathing } from "@/hooks/use-breathing";
import { cn } from "@/lib/utils";

type PatternType = "478" | "box" | "22" | "555";

const breathingPatterns: Record<PatternType, { name: string; sequence: number[] }> = {
  "478": { name: "4-7-8 Relaxation", sequence: [4, 7, 8] },
  "box": { name: "Box Breathing (4x4)", sequence: [4, 4, 4, 4] },
  "22": { name: "2-2 Energized Focus", sequence: [2, 2] },
  "555": { name: "5-5-5 Triangle", sequence: [5, 5, 5] },
};

export default function BreathworkPage() {
  const { user } = useUser();
  const [selectedPattern, setSelectedPattern] = useState<PatternType>("box");
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const { 
    isActive,
    isPaused,
    currentPhase,
    currentCycle,
    elapsedTime,
    countdown,
    startSession,
    pauseSession,
    resumeSession,
    endSession
  } = useBreathing(breathingPatterns[selectedPattern].sequence);

  const handlePatternChange = useCallback((value: PatternType) => {
    if (isActive) {
      endSession();
    }
    setSelectedPattern(value);
  }, [isActive, endSession]);

  const breathCount = currentCycle * breathingPatterns[selectedPattern].sequence.length + 
    (currentPhase > 0 ? currentPhase : 0);

  return (
    <div className={cn(
      "min-h-screen bg-background transition-all duration-500",
      isZenMode ? "p-0" : "p-4"
    )}>
      <div className={cn(
        "max-w-4xl mx-auto space-y-6",
        isZenMode && "hidden"
      )}>
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Welcome, {user?.username}</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <ErrorBoundary>
            <Card>
              <CardHeader className="pb-[15px]">
                <CardTitle>Breath Session</CardTitle>
              </CardHeader>
              <CardContent>
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
                  onStart={startSession}
                  onPause={pauseSession}
                  onResume={resumeSession}
                  onStop={endSession}
                  onToggleZen={() => setIsZenMode(prev => !prev)}
                  onToggleSound={() => setIsSoundEnabled(prev => !prev)}
                  onPatternChange={handlePatternChange}
                />
              </CardContent>
            </Card>
          </ErrorBoundary>

          <Card className={cn(isZenMode && "hidden")}>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart />
            </CardContent>
          </Card>
        </div>
      </div>

      {isZenMode && (
        <ErrorBoundary>
          <div className="fixed inset-0 bg-background">
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
              onStart={startSession}
              onPause={pauseSession}
              onResume={resumeSession}
              onStop={endSession}
              onToggleZen={() => setIsZenMode(prev => !prev)}
              onToggleSound={() => setIsSoundEnabled(prev => !prev)}
              onPatternChange={handlePatternChange}
            />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}