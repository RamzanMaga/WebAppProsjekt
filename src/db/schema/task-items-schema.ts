import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { users } from "./user-schema";
import { tasks } from "./task-schema";
import { taskPlans } from "./task-plan-schema";

export const taskItems = sqliteTable(
  "task_items",
  {
    id: integer("task_items_id").primaryKey({
      autoIncrement: true,
    }),

    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    planId: integer("plan_id").references(() => taskPlans.id),

    week: integer("week"),

    reviewedBy: integer("reviewed_by").references(() => users.id),

    ansattRapport: text("ansatt_rapport"),

    titles: text("titles").notNull(),

    description: text("description"),

    status: text("status").notNull().default("todo"),

    completedAt: text("completed_at"),
  },
  (table) => [
    // Hindrer at samme oppgave tildeles flere ganger i én ukeplan.
    uniqueIndex("idx_task_items_plan_task").on(table.planId, table.taskId),
  ],
);
