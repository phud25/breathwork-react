import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { sessions, achievements, favoritePatterns } from "@db/schema";
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