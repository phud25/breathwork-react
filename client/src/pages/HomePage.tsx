import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BreathingGuide } from "@/components/BreathingGuide";
import { ProgressChart } from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useBreathing } from "@/hooks/use-breathing";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

const breathingPatterns = {
  "478": { name: "4-7-8 Relaxation", sequence: [4, 7, 8] },
  "box": { name: "Box Breathing (4x4)", sequence: [4, 4, 4, 4] },
  "22": { name: "2-2 Energized Focus", sequence: [2, 2] },
  "555": { name: "5-5-5 Triangle", sequence: [5, 5, 5] },
  "custom": { name: "Custom Pattern", sequence: [4, 4] }
};

export default function HomePage() {
  const { user, logout } = useUser();
  const [selectedPattern, setSelectedPattern] = useState("478");
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const { 
    isActive,
    isPaused,
    currentPhase,
    elapsedTime,
    startSession,
    pauseSession,
    resumeSession,
    endSession
  } = useBreathing(breathingPatterns[selectedPattern as keyof typeof breathingPatterns].sequence);

  const handlePatternChange = useCallback((value: string) => {
    if (isActive) {
      endSession();
    }
    setSelectedPattern(value);
  }, [isActive, endSession]);

  const handleToggleZen = () => {
    setIsZenMode(prev => !prev);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

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
          <Button variant="outline" onClick={() => logout()}>Logout</Button>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Breathing Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={selectedPattern}
                  onValueChange={handlePatternChange}
                  disabled={isActive}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(breathingPatterns).map(([key, pattern]) => (
                      <SelectItem key={key} value={key}>
                        {pattern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <BreathingGuide 
                    pattern={breathingPatterns[selectedPattern as keyof typeof breathingPatterns]}
                    isActive={isActive}
                    isPaused={isPaused}
                    currentPhase={currentPhase}
                    isZenMode={isZenMode}
                    isSoundEnabled={isSoundEnabled}
                    elapsed={elapsedTime}
                    onPause={pauseSession}
                    onResume={resumeSession}
                    onStop={endSession}
                    onToggleZen={handleToggleZen}
                    onToggleSound={handleToggleSound}
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>

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
        <div className="fixed inset-0 bg-background">
          <BreathingGuide 
            pattern={breathingPatterns[selectedPattern as keyof typeof breathingPatterns]}
            isActive={isActive}
            isPaused={isPaused}
            currentPhase={currentPhase}
            isZenMode={isZenMode}
            isSoundEnabled={isSoundEnabled}
            elapsed={elapsedTime}
            onPause={pauseSession}
            onResume={resumeSession}
            onStop={endSession}
            onToggleZen={handleToggleZen}
            onToggleSound={handleToggleSound}
          />
        </div>
      )}
    </div>
  );
}