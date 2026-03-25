import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});
