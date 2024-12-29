import { useState } from "react";
import { motion } from "framer-motion";
import { BreathingGuide } from "@/components/BreathingGuide";
import { ProgressChart } from "@/components/ProgressChart";
import { SessionTimer } from "@/components/SessionTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useBreathing } from "@/hooks/use-breathing";
import { useUser } from "@/hooks/use-user";

const breathingPatterns = {
  "box": { name: "Box Breathing", sequence: [4, 4, 4, 4] },
  "478": { name: "4-7-8 Breathing", sequence: [4, 7, 8] },
  "deep": { name: "Deep Breathing", sequence: [4, 4] }
};

export default function HomePage() {
  const { user, logout } = useUser();
  const [selectedPattern, setSelectedPattern] = useState("box");
  const { 
    isActive,
    currentPhase,
    startSession,
    endSession
  } = useBreathing(breathingPatterns[selectedPattern as keyof typeof breathingPatterns].sequence);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
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
                  onValueChange={setSelectedPattern}
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
                    currentPhase={currentPhase}
                  />
                </motion.div>

                <SessionTimer
                  isActive={isActive}
                  onStart={startSession}
                  onEnd={endSession}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
