import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { floors } from "./floor-schema";
import { users } from "./user-schema";
export const taskPlans = sqliteTable(
  "task_plans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    // Hvilken etasje ukeplanen tilhører
    floorId: integer("floor_id")
      .notNull()
      .references(() => floors.id),

    // Mandag i den aktuelle uken
    weekStart: text("week_start").notNull(),

    // Om ukeplanen er publisert
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    // Etasjens samlede vurdering for denne uken
    reviewStatus: text("review_status").notNull().default("pending"),

    // Ansatt som vurderte etasjen
    reviewedBy: integer("reviewed_by").references(() => users.id),

    // Rapport fra ansatt
    ansattRapport: text("ansatt_rapport"),

    // Tidspunkt for vurderingen
    reviewedAt: text("reviewed_at"),
  },
  (table) => [
    uniqueIndex("idx_task_plans_floor_week").on(table.floorId, table.weekStart),
  ],
);
