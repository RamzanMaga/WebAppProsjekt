import { sqliteTable, int } from "drizzle-orm/sqlite-core";
import { buildings } from "./building-schema";

export const floors = sqliteTable("floors", {
  id: int().primaryKey({ autoIncrement: true }),

  buildingId: int("building_id")
    .notNull()
    .references(() => buildings.id),

  number: int().notNull(),
});
