import { sqliteTable, int, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { floors } from "./floor-schema";

export const ansattReviews = sqliteTable(
  "ansatt_reviews",
  {
    id: int("id").primaryKey({ autoIncrement: true }),

    floorId: int("floor_id")
      .notNull()
      .references(() => floors.id),

    weekStart: text("week_start").notNull(),

    checks: text("checks").notNull(),

    comment: text("comment").notNull(),

    status: text("status").notNull(),

    reviewedBy: int("reviewed_by").notNull(),
  },
  (table) => [
    uniqueIndex("ansatt_reviews_floor_week_unique").on(
      table.floorId,
      table.weekStart,
    ),
  ],
);
