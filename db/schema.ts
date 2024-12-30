import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  totalMinutes: integer("total_minutes").default(0).notNull(),
  totalHoldTime: integer("total_hold_time").default(0).notNull(),
  longestHold: integer("longest_hold").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pattern: text("pattern").notNull(),
  duration: integer("duration").notNull(),
  breathCount: integer("breath_count").notNull(),
  holdCount: integer("hold_count").default(0).notNull(),
  totalHoldTime: integer("total_hold_time").default(0).notNull(),
  longestHold: integer("longest_hold").default(0).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull()
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  metadata: json("metadata")
});

export const favoritePatterns = pgTable("favorite_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  sequence: json("sequence").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isQuickSave: boolean("is_quick_save").default(false).notNull()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

export type FavoritePattern = typeof favoritePatterns.$inferSelect;
export type NewFavoritePattern = typeof favoritePatterns.$inferInsert;