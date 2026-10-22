import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    tasks: r.many.tasks({
      from: r.users.id,
      to: r.tasks.userId,
    }),

    building: r.one.buildings({
      from: r.users.buildingId,
      to: r.buildings.id,
    }),

    floor: r.one.floors({
      from: r.users.floorId,
      to: r.floors.id,
    }),

    bookings: r.many.bookings({
      from: r.users.id,
      to: r.bookings.userId,
    }),

    taskItems: r.many.taskItems({
      from: r.users.id,
      to: r.taskItems.userId,
    }),

    approvedTasks: r.many.tasks({
      from: r.users.id,
      to: r.tasks.approved,
      alias: "approvedTasks",
    }),
  },

  tasks: {
    user: r.one.users({
      from: r.tasks.userId,
      to: r.users.id,
      optional: false,
    }),

    floor: r.one.floors({
      from: r.tasks.floorId,
      to: r.floors.id,
    }),

    approvedBy: r.one.users({
      from: r.tasks.approved,
      to: r.users.id,
      alias: "approvedTasks",
    }),

    items: r.many.taskItems({
      from: r.tasks.id,
      to: r.taskItems.taskId,
    }),
  },

  buildings: {
    floors: r.many.floors({
      from: r.buildings.id,
      to: r.floors.buildingId,
    }),

    users: r.many.users({
      from: r.buildings.id,
      to: r.users.buildingId,
    }),

    bookings: r.many.bookings({
      from: r.buildings.id,
      to: r.bookings.buildingId,
    }),
  },

  floors: {
    building: r.one.buildings({
      from: r.floors.buildingId,
      to: r.buildings.id,
      optional: false,
    }),

    users: r.many.users({
      from: r.floors.id,
      to: r.users.floorId,
    }),

    tasks: r.many.tasks({
      from: r.floors.id,
      to: r.tasks.floorId,
    }),
  },

  bookings: {
    user: r.one.users({
      from: r.bookings.userId,
      to: r.users.id,
      optional: false,
    }),

    building: r.one.buildings({
      from: r.bookings.buildingId,
      to: r.buildings.id,
      optional: false,
    }),
  },

  taskItems: {
    task: r.one.tasks({
      from: r.taskItems.taskId,
      to: r.tasks.id,
      optional: false,
    }),

    user: r.one.users({
      from: r.taskItems.userId,
      to: r.users.id,
    }),
  },

  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),
  },
}));

export type Relations = typeof relations;
