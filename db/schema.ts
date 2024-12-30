import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Define users table with proper constraints
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").default('').notNull(),
  lastName: text("last_name").default('').notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  totalMinutes: integer("total_minutes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pattern: text("pattern").notNull(),
  duration: integer("duration").notNull(),
  breathCount: integer("breath_count").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull()
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  metadata: jsonb("metadata")
});

// Schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const selectUserSchema = createSelectSchema(users);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;