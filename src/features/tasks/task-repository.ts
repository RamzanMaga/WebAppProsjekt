import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { tasks, taskPlans, taskItems, users } from "../../db/schema";

export async function createTask(data: typeof tasks.$inferInsert) {
  const [task] = await db.insert(tasks).values(data).returning();
  return task;
}

export async function getAllTasks() {
  return db.select().from(tasks);
}

export async function getTaskById(id: string) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

  return task ?? null;
}

export async function updateTask(
  id: string,
  data: Partial<typeof tasks.$inferInsert>,
) {
  const [task] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, id))
    .returning();

  return task ?? null;
}

export async function deleteTask(id: string) {
  const [task] = await db.delete(tasks).where(eq(tasks.id, id)).returning();

  return task ?? null;
}

export async function getWeeklyPlan(floorId: number, weekStart: string) {
  const [plan] = await db
    .select()
    .from(taskPlans)
    .where(
      and(eq(taskPlans.floorId, floorId), eq(taskPlans.weekStart, weekStart)),
    );

  return plan ?? null;
}

export async function getWeeklyPlanById(planId: number) {
  const [plan] = await db
    .select()
    .from(taskPlans)
    .where(eq(taskPlans.id, planId));

  return plan ?? null;
}

export async function createWeeklyPlan(floorId: number, weekStart: string) {
  const existing = await getWeeklyPlan(floorId, weekStart);

  if (existing) {
    return existing;
  }

  const [plan] = await db
    .insert(taskPlans)
    .values({
      floorId,
      weekStart,
    })
    .onConflictDoNothing()
    .returning();

  return plan ?? getWeeklyPlan(floorId, weekStart);
}

export async function getWeeklyTasks(planId: number) {
  return db
    .select({
      id: taskItems.id,
      taskId: taskItems.taskId,
      userId: taskItems.userId,
      planId: taskItems.planId,
      week: taskItems.week,
      reviewedBy: taskItems.reviewedBy,
      ansattRapport: taskItems.ansattRapport,
      titles: taskItems.titles,
      description: taskItems.description,
      status: taskItems.status,
      completedAt: taskItems.completedAt,
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
    })
    .from(taskItems)
    .innerJoin(users, eq(taskItems.userId, users.id))
    .where(eq(taskItems.planId, planId));
}

export async function getUserById(userId: number) {
  const [user] = await db
    .select({
      id: users.id,
      floorId: users.floorId,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId));

  return user ?? null;
}

export async function getWeeklyTaskSource(taskId: string) {
  const [task] = await db
    .select({
      id: tasks.id,
      floorId: tasks.floorId,
      title: tasks.title,
      description: tasks.description,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId));

  return task ?? null;
}

export async function getWeeklyTaskItemById(itemId: number) {
  const [item] = await db
    .select()
    .from(taskItems)
    .where(eq(taskItems.id, itemId));

  return item ?? null;
}

export async function getWeeklyTaskBySource(planId: number, taskId: string) {
  const [item] = await db
    .select()
    .from(taskItems)
    .where(and(eq(taskItems.planId, planId), eq(taskItems.taskId, taskId)));

  return item ?? null;
}

export async function assignWeeklyTask(data: {
  planId: number;
  taskId: string;
  userId: number;
  title: string;
  description?: string | null;
}) {
  const [insertedItem] = await db
    .insert(taskItems)
    .values({
      planId: data.planId,
      taskId: data.taskId,
      userId: data.userId,
      titles: data.title,
      description: data.description,
      status: "todo",
    })
    .onConflictDoNothing({
      target: [taskItems.planId, taskItems.taskId],
    })
    .returning();

  if (insertedItem) {
    return insertedItem;
  }

  return getWeeklyTaskBySource(data.planId, data.taskId);
}

export async function updateWeeklyTask(
  itemId: number,
  data: {
    userId?: number;
    description?: string | null;
  },
) {
  const [item] = await db
    .update(taskItems)
    .set(data)
    .where(eq(taskItems.id, itemId))
    .returning();

  return item ?? null;
}

export async function deleteWeeklyTask(itemId: number) {
  const [item] = await db
    .delete(taskItems)
    .where(eq(taskItems.id, itemId))
    .returning();

  return item ?? null;
}

export async function completeWeeklyTask(itemId: number, studentId: number) {
  const [item] = await db
    .update(taskItems)
    .set({
      status: "completed",
      completedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(taskItems.id, itemId),
        eq(taskItems.userId, studentId),
        eq(taskItems.status, "todo"),
      ),
    )
    .returning();

  return item ?? null;
}

export async function reviewWeeklyPlan(
  planId: number,
  reviewerId: number,
  approved: boolean,
  report: string,
) {
  const [plan] = await db
    .update(taskPlans)
    .set({
      reviewStatus: approved ? "approved" : "rejected",
      reviewedBy: reviewerId,
      ansattRapport: report,
      reviewedAt: new Date().toISOString(),
    })
    .where(and(eq(taskPlans.id, planId), eq(taskPlans.reviewStatus, "pending")))
    .returning();

  return plan ?? null;
}

export async function getStudentsByFloor(floorId: number) {
  return db
    .select({
      id: users.id,
      floorId: users.floorId,
    })
    .from(users)
    .where(and(eq(users.floorId, floorId), eq(users.role, "student")));
}
