import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { sessions, achievements } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get user's sessions
  app.get("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    const userSessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, req.user.id),
      orderBy: (sessions, { desc }) => [desc(sessions.completedAt)],
      limit: 50
    });

    res.json(userSessions);
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

  const httpServer = createServer(app);
  return httpServer;
}
