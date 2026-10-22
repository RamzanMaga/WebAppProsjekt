import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { floors } from "./floor-schema";

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    title: text("title").notNull(),

    floorId: integer("floor_id").references(() => floors.id),

    status: text("status").notNull().default("todo"),

    description: text("description"),

    approved: integer("approved").references(() => users.id),

    ansatRapport: text("ansat_rapport"),

    date: text("date"),

    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),

    dueDate: integer("due_date", { mode: "timestamp" }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [index("idx_tasks_user_id").on(table.userId)],
);

export type Task = typeof tasks.$inferSelect;
export type CreateTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<CreateTask>;
