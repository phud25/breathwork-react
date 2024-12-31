import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Sun, Moon } from "lucide-react";
import { useAudio } from "@/hooks/use-audio";

export default function TrancePage() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const audioRefs = {
    manifestation: useRef<HTMLAudioElement>(null),
    energizer: useRef<HTMLAudioElement>(null),
    sleep: useRef<HTMLAudioElement>(null)
  };

  useEffect(() => {
    // Play the appropriate audio when a session is activated
    Object.entries(audioRefs).forEach(([key, ref]) => {
      if (ref.current) {
        if (activeSession === key) {
          ref.current.play().catch(error => {
            console.error('Audio playback failed:', error);
          });
        } else {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      }
    });
  }, [activeSession]);

  return (
    <div className="relative w-full max-w-[100vw] overflow-x-hidden">
      <Navigation />
      <main className="min-h-screen pt-[30px] pb-8 px-4 bg-background">
        <div className="container max-w-6xl mx-auto grid gap-4 md:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="group cursor-pointer transition-all hover:border-primary/50 bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
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
                  <div className="pt-4 border-t border-purple-500/20">
                    <audio
                      ref={audioRefs.manifestation}
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

            <Card className="group cursor-pointer transition-all hover:border-primary/50 bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
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
                  <div className="pt-4 border-t border-purple-500/20">
                    <audio
                      ref={audioRefs.energizer}
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

            <Card className="group cursor-pointer transition-all hover:border-primary/50 bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
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
                  <div className="pt-4 border-t border-purple-500/20">
                    <audio
                      ref={audioRefs.sleep}
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
        </div>
      </main>
    </div>
  );
}