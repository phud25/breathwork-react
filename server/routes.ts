import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { sessions, achievements, favoritePatterns } from "@db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get user's sessions with optional date filter
  app.get("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { date } = req.query;
    let query = db.query.sessions.findMany({
      where: eq(sessions.userId, req.user.id),
      orderBy: (sessions, { desc }) => [desc(sessions.completedAt)],
      limit: 50
    });

    if (date) {
      const startOfDay = new Date(date as string);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      query = db.query.sessions.findMany({
        where: and(
          eq(sessions.userId, req.user.id),
          gte(sessions.completedAt, startOfDay),
          lte(sessions.completedAt, endOfDay)
        ),
        orderBy: (sessions, { desc }) => [desc(sessions.completedAt)]
      });
    }

    const userSessions = await query;
    res.json(userSessions);
  });

  // Get user's session statistics
  app.get("/api/sessions/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const stats = await db.select({
      totalSessions: sql<number>`count(*)`,
      totalMinutes: sql<number>`sum(duration) / 60`,
    })
    .from(sessions)
    .where(eq(sessions.userId, req.user.id));

    // Calculate streaks
    const userSessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, req.user.id),
      orderBy: (sessions, { desc }) => [desc(sessions.completedAt)]
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let currentCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < userSessions.length; i++) {
      const sessionDate = new Date(userSessions[i].completedAt);
      sessionDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        // First session
        currentCount = 1;
        // If the first session is from today, start the current streak
        if (sessionDate.getTime() === today.getTime()) {
          currentStreak = 1;
        }
      } else {
        const prevDate = new Date(userSessions[i - 1].completedAt);
        prevDate.setHours(0, 0, 0, 0);

        // Check if sessions are on consecutive days
        const diffDays = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentCount++;
          // Update current streak if the streak includes today
          if (i === 0 || new Date(userSessions[0].completedAt).setHours(0, 0, 0, 0) === today.getTime()) {
            currentStreak = currentCount;
          }
        } else {
          if (currentCount > longestStreak) {
            longestStreak = currentCount;
          }
          currentCount = 1;
        }
      }
    }

    // Update longest streak if the current streak is longer
    if (currentCount > longestStreak) {
      longestStreak = currentCount;
    }

    // Calculate daily stats for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayStats = await db.select({
      totalBreaths: sql<number>`sum(breath_count)`,
      totalHolds: sql<number>`sum(hold_count)`,
      totalHoldTime: sql<number>`sum(total_hold_time)`,
      longestHold: sql<number>`max(longest_hold)`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, req.user.id),
        gte(sessions.completedAt, todayStart),
        lte(sessions.completedAt, todayEnd)
      )
    );

    res.json({
      totalSessions: Number(stats[0].totalSessions),
      totalMinutes: Math.round(Number(stats[0].totalMinutes)),
      currentStreak,
      longestStreak,
      todayStats: {
        totalBreaths: Number(todayStats[0].totalBreaths) || 0,
        totalHolds: Number(todayStats[0].totalHolds) || 0,
        totalHoldTime: Number(todayStats[0].totalHoldTime) || 0,
        longestHold: Number(todayStats[0].longestHold) || 0
      }
    });
  });

  // Save new session
  app.post("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { pattern, duration, breathCount } = req.body;

    const [newSession] = await db.insert(sessions)
      .values({
        userId: req.user.id,
        pattern,
        duration,
        breathCount,
      })
      .returning();

    res.json(newSession);
  });

  // Get user achievements
  app.get("/api/achievements", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userAchievements = await db.query.achievements.findMany({
      where: eq(achievements.userId, req.user.id),
      orderBy: (achievements, { desc }) => [desc(achievements.unlockedAt)]
    });

    res.json(userAchievements);
  });

  // Get favorite patterns
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const favorites = await db.query.favoritePatterns.findMany({
      where: eq(favoritePatterns.userId, req.user.id),
      orderBy: (patterns, { desc }) => [desc(patterns.createdAt)]
    });

    res.json(favorites);
  });

  // Save favorite pattern
  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { name, sequence, isQuickSave = false } = req.body;

    // If it's a quick save, remove the previous quick save
    if (isQuickSave) {
      await db.delete(favoritePatterns)
        .where(eq(favoritePatterns.userId, req.user.id))
        .where(eq(favoritePatterns.isQuickSave, true));
    }

    const [favorite] = await db.insert(favoritePatterns)
      .values({
        userId: req.user.id,
        name,
        sequence,
        isQuickSave
      })
      .returning();

    res.json(favorite);
  });

  // Delete favorite pattern
  app.delete("/api/favorites/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const { id } = req.params;

    await db.delete(favoritePatterns)
      .where(eq(favoritePatterns.id, parseInt(id)))
      .where(eq(favoritePatterns.userId, req.user.id));

    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}