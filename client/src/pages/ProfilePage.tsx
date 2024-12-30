import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export default function ProfilePage() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-[66px] px-4 pb-8 bg-background">
        <div className="container max-w-4xl mx-auto space-y-6">
          {/* User Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="text-lg font-medium">{user?.username}</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline">Change Password</Button>
                  <Button>Edit Profile</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">3 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">24</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-[auto,1fr]">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Sessions for {selectedDate?.toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Session list will be implemented later */}
                    <p className="text-sm text-muted-foreground">No sessions for this date.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}