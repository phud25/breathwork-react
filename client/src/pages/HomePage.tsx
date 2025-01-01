import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Brain, User } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/breathwork">
              <Card className="group cursor-pointer transition-all hover:border-primary/50 max-w-[90%] mx-auto md:max-w-none bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
                <CardHeader className="p-4 md:p-6">
                  <Wind className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
                  <CardTitle className="text-lg md:text-xl">Breathwork Sessions</CardTitle>
                  <CardDescription>
                    Explore guided breathing exercises designed to enhance focus, relaxation, and energy levels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <Button className="w-full">Start Session</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/trance">
              <Card className="group cursor-pointer transition-all hover:border-primary/50 max-w-[90%] mx-auto md:max-w-none bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
                <CardHeader className="p-4 md:p-6">
                  <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
                  <CardTitle className="text-lg md:text-xl">Guided Trance</CardTitle>
                  <CardDescription>
                    Experience deep meditative states with guided trance sessions for enhanced mindfulness.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <Button className="w-full">Begin Journey</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card className="group cursor-pointer transition-all hover:border-primary/50 max-w-[90%] mx-auto md:max-w-none bg-gradient-to-br from-purple-600/20 to-purple-800/10 backdrop-blur-sm shadow-lg shadow-purple-900/10 border-purple-500/20">
                <CardHeader className="p-4 md:p-6">
                  <User className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
                  <CardTitle className="text-lg md:text-xl">Profile</CardTitle>
                  <CardDescription>
                    Track your progress, view session history, and customize your experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <Button className="w-full">View Profile</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}