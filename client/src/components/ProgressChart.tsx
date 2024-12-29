import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Loader2 } from "lucide-react";
import type { Session } from "@db/schema";

export function ProgressChart() {
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const chartData = useMemo(() => {
    if (!sessions) return [];

    // Create an array of the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      return {
        date,
        dateStr: format(date, "MMM d"),
        minutes: 0,
        sessions: 0,
      };
    }).reverse();

    // Group sessions by day
    sessions.forEach((session) => {
      const sessionDate = startOfDay(new Date(session.completedAt));
      const dayData = last7Days.find(
        (day) => day.date.getTime() === sessionDate.getTime()
      );
      if (dayData) {
        dayData.minutes += Math.round(session.duration / 60);
        dayData.sessions += 1;
      }
    });

    return last7Days;
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="dateStr"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            label={{
              value: "Minutes",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Bar
            dataKey="minutes"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
