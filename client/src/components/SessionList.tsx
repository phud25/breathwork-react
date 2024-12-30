import { format } from "date-fns";
import type { Session } from "@db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface SessionListProps {
  sessions: Session[];
}

export function SessionList({ sessions }: SessionListProps) {
  if (!sessions.length) {
    return (
      <p className="text-sm text-muted-foreground">No sessions for this date.</p>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{session.pattern.split("-").join(":") || "Custom Pattern"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.completedAt), "h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{session.breathCount} breaths</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
