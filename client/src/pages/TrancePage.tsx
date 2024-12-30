import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Sun, Moon } from "lucide-react";
import { useAudio } from "@/hooks/use-audio";

export default function TrancePage() {
  const [activeSession, setActiveSession] = useState<string | null>(null);

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-[66px] pb-8 px-4 bg-background">
        <div className="container max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          <Card className="group transition-all hover:border-primary/50">
            <CardHeader>
              <Rocket className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Daily Manifestation</CardTitle>
              <CardDescription>
                Start your day with purpose and clarity through guided manifestation meditation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => setActiveSession(activeSession === 'manifestation' ? null : 'manifestation')}
              >
                {activeSession === 'manifestation' ? 'Hide Session' : 'Start Session'}
              </Button>
              {activeSession === 'manifestation' && (
                <div className="pt-4 border-t">
                  <audio
                    controls
                    className="w-full"
                    src="/audio/DM.mp3"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardHeader>
              <Sun className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Mid-Day Energizer</CardTitle>
              <CardDescription>
                Recharge your energy and focus with this revitalizing guided meditation session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => setActiveSession(activeSession === 'energizer' ? null : 'energizer')}
              >
                {activeSession === 'energizer' ? 'Hide Session' : 'Start Session'}
              </Button>
              {activeSession === 'energizer' && (
                <div className="pt-4 border-t">
                  <audio
                    controls
                    className="w-full"
                    src="/audio/2-2bg.mp3"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="group transition-all hover:border-primary/50">
            <CardHeader>
              <Moon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Deep Sleep</CardTitle>
              <CardDescription>
                Drift into peaceful sleep with calming guidance for deep relaxation and rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => setActiveSession(activeSession === 'sleep' ? null : 'sleep')}
              >
                {activeSession === 'sleep' ? 'Hide Session' : 'Start Session'}
              </Button>
              {activeSession === 'sleep' && (
                <div className="pt-4 border-t">
                  <audio
                    controls
                    className="w-full"
                    src="/audio/meditation-bg.mp3"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}