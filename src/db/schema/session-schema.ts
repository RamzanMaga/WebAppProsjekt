import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";

export const sessions = sqliteTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),

  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  expiresAt: int("expires_at").notNull(),
});
