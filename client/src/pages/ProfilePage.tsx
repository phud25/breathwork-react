import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useSessions, useSessionStats } from "@/hooks/use-sessions";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { SessionList } from "@/components/SessionList";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: sessions, isLoading: isLoadingSessions } = useSessions(selectedDate);
  const { data: stats, isLoading: isLoadingStats } = useSessionStats();

  const isLoading = isLoadingSessions || isLoadingStats;

  const todaySessions = sessions || [];
  const todayStats = todaySessions.reduce((acc, session) => ({
    totalBreaths: acc.totalBreaths + session.breathCount,
    totalMinutes: acc.totalMinutes + Math.floor(session.duration / 60),
    totalHolds: acc.totalHolds + session.holdCount,
    totalHoldTime: acc.totalHoldTime + session.totalHoldTime,
    longestHold: Math.max(acc.longestHold, session.longestHold)
  }), {
    totalBreaths: 0,
    totalMinutes: 0,
    totalHolds: 0,
    totalHoldTime: 0,
    longestHold: 0
  });

  const avgHoldTime = todayStats.totalHolds > 0
    ? Math.round(todayStats.totalHoldTime / todayStats.totalHolds)
    : 0;

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

          {/* Daily Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{todaySessions.length}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Breaths</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.todayStats?.totalBreaths || 0}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.todayStats?.totalMinutes || 0}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hold</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{Math.floor((stats?.todayStats?.totalHoldTime || 0) / 60)}:{((stats?.todayStats?.totalHoldTime || 0) % 60).toString().padStart(2, '0')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid gap-4">
            {/* Current Streak Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Current Streak Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.currentStreak || 0} days</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Breaths</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.todayStats?.totalBreaths || 0}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.totalMinutes || 0}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hold</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.todayStats?.totalHolds || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breath Hold Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Breath Hold Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Hold</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {Math.floor((stats?.todayStats?.totalHoldTime || 0) / (stats?.todayStats?.totalHolds || 1) / 60)}:
                        {((stats?.todayStats?.totalHoldTime || 0) / (stats?.todayStats?.totalHolds || 1) % 60).toFixed(0).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longest Hold</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {Math.floor((stats?.todayStats?.longestHold || 0) / 60)}:
                        {((stats?.todayStats?.longestHold || 0) % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
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
                    {isLoadingSessions ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <SessionList sessions={sessions || []} />
                    )}
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