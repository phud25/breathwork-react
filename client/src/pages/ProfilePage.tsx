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
          <div className="grid gap-4">
            {/* Streak Cards - Force single row */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.currentStreak || 0} days</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.longestStreak || 0} days</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak Sessions</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Breaths</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {sessions?.reduce((acc, session) => acc + session.breathCount, 0) || 0}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Minutes</p>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold">{stats?.totalMinutes || 0}</p>
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
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_today: "bg-accent text-accent-foreground",
                    cell: "text-center h-9 w-9 p-0 relative [&:has([aria-selected].day)]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    head_cell: "text-muted-foreground font-normal text-[0.8rem] w-9 flex items-center justify-center",
                    nav: "space-x-1 flex items-center justify-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    caption: "flex justify-center pt-1 relative items-center mb-3",
                    caption_label: "text-sm font-medium",
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    tbody: "grid gap-1",
                    head: "grid grid-cols-7 gap-1",
                    row: "grid grid-cols-7 gap-1",
                  }}
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