import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Brain, User } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-[66px] pb-8 px-4 bg-background">
        <div className="container max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          <Link href="/breathwork">
            <Card className="group cursor-pointer transition-all hover:border-primary/50">
              <CardHeader>
                <Wind className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Breathwork Sessions</CardTitle>
                <CardDescription>
                  Explore guided breathing exercises designed to enhance focus, relaxation, and energy levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Session</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/trance">
            <Card className="group cursor-pointer transition-all hover:border-primary/50">
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Guided Trance</CardTitle>
                <CardDescription>
                  Experience deep meditative states with guided trance sessions for enhanced mindfulness.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Begin Journey</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="group cursor-pointer transition-all hover:border-primary/50">
              <CardHeader>
                <User className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Track your progress, view session history, and customize your experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Profile</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}