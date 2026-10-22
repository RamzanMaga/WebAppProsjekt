import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

export const buildings = sqliteTable("buildings", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
});