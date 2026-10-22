import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { floors } from "./floor-schema";
import { buildings } from "./building-schema";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  passwordHash: text("password_hash"),

  role: text("role").notNull().default("student"),
  buildingId: int("building_id").references(() => buildings.id),
  floorId: int("floor_id").references(() => floors.id),
});

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
