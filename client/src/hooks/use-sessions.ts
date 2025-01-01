import { useQuery } from '@tanstack/react-query';
import type { Session } from "@db/schema";

export function useSessions(date?: Date) {
  const dateStr = date?.toISOString().split('T')[0];
  
  return useQuery<Session[]>({
    queryKey: ['/api/sessions', dateStr],
    queryFn: async () => {
      const url = dateStr ? `/api/sessions?date=${dateStr}` : '/api/sessions';
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      return response.json();
    }
  });
}

interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalBreaths: number;
  totalHolds: number;
  totalHoldTime: number;
  totalSets: number;
  longestSession: number;
  longestHold: number;
}

export function useSessionStats() {
  return useQuery<SessionStats>({
    queryKey: ['/api/sessions/stats'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session stats');
      }

      return response.json();
    }
  });
}