import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { buildings } from "./building-schema";

export const bookings = sqliteTable("bookings", {
  id: int("booking_id").primaryKey({ autoIncrement: true }),

  userId: int("user_id")
    .notNull()
    .references(() => users.id),

  buildingId: int("building_id")
    .notNull()
    .references(() => buildings.id),

  type: text("type").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});
