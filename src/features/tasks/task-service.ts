import { tasks } from "../../db/schema";
import * as repository from "./task-repository";

function requireValidId(id: number, message: string) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(message);
  }
}

function isValidWeekStart(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date.getUTCDay() === 1
  );
}

async function requireStudentOnFloor(userId: number, floorId: number) {
  requireValidId(userId, "Ugyldig student-ID");

  const user = await repository.getUserById(userId);

  if (!user || user.role !== "student") {
    throw new Error("Bare studenter kan utføre denne handlingen");
  }

  if (user.floorId !== floorId) {
    throw new Error("Studenten tilhører en annen etasje");
  }

  return user;
}

async function requireEditablePlan(planId: number) {
  requireValidId(planId, "Ugyldig ukeplan-ID");

  const plan = await repository.getWeeklyPlanById(planId);

  if (!plan) {
    throw new Error("Ukeplanen finnes ikke");
  }

  if (plan.reviewStatus !== "pending") {
    throw new Error("Vurdert ukeplan kan ikke endres");
  }

  return plan;
}

export async function createTask(data: typeof tasks.$inferInsert) {
  if (!data.title?.trim()) {
    throw new Error("Tittel er påkrevd");
  }

  return repository.createTask({
    ...data,
    title: data.title.trim(),
  });
}

export async function getAllTasks() {
  return repository.getAllTasks();
}

export async function getTaskById(id: string) {
  return repository.getTaskById(id);
}

export async function updateTask(
  id: string,
  data: Partial<typeof tasks.$inferInsert>,
) {
  if (data.title !== undefined && !data.title.trim()) {
    throw new Error("Tittel kan ikke være tom");
  }

  return repository.updateTask(id, {
    ...data,
    ...(data.title !== undefined && {
      title: data.title.trim(),
    }),
  });
}

export async function deleteTask(id: string) {
  return repository.deleteTask(id);
}

export async function getWeeklyPlan(floorId: number, weekStart: string) {
  requireValidId(floorId, "Ugyldig etasje");

  if (!isValidWeekStart(weekStart)) {
    throw new Error("Ugyldig uke. Bruk mandag i format YYYY-MM-DD");
  }

  const plan = await repository.getWeeklyPlan(floorId, weekStart);

  if (!plan) {
    return null;
  }

  const items = await repository.getWeeklyTasks(plan.id);

  return {
    ...plan,
    items,
  };
}

export async function createWeeklyPlan(floorId: number, weekStart: string) {
  requireValidId(floorId, "Ugyldig etasje");

  if (!isValidWeekStart(weekStart)) {
    throw new Error("Ugyldig uke. Bruk mandag i format YYYY-MM-DD");
  }

  const plan = await repository.createWeeklyPlan(floorId, weekStart);

  if (!plan) {
    throw new Error("Kunne ikke opprette ukeplan");
  }

  if (plan.reviewStatus !== "pending") {
    return plan;
  }

  const existingItems = await repository.getWeeklyTasks(plan.id);

  const allTasks = await repository.getAllTasks();

  const floorTasks = allTasks.filter((task) => task.floorId === floorId);

  const assignedTaskIds = new Set(existingItems.map((item) => item.taskId));

  const missingTasks = floorTasks.filter(
    (task) => !assignedTaskIds.has(task.id),
  );

  if (missingTasks.length === 0) {
    return plan;
  }

  const students = await repository.getStudentsByFloor(floorId);

  if (students.length === 0) {
    throw new Error("Ingen studenter finnes i denne etasjen");
  }

  const distribution = distributeTasksRandomly(
    missingTasks,
    students.map((student) => student.id),
  );

  for (const { task, studentId } of distribution) {
    await repository.assignWeeklyTask({
      planId: plan.id,
      taskId: task.id,
      userId: studentId,
      title: task.title,
      description: task.description,
    });
  }

  return plan;
}

export async function assignWeeklyTask(
  actorId: number,
  data: {
    planId: number;
    taskId: string;
    userId: number;
  },
) {
  const plan = await requireEditablePlan(data.planId);

  await requireStudentOnFloor(actorId, plan.floorId);

  await requireStudentOnFloor(data.userId, plan.floorId);

  if (!data.taskId?.trim()) {
    throw new Error("Oppgave-ID er påkrevd");
  }

  const source = await repository.getWeeklyTaskSource(data.taskId);

  if (!source) {
    throw new Error("Standardoppgaven finnes ikke");
  }

  if (source.floorId !== plan.floorId) {
    throw new Error("Standardoppgaven tilhører en annen etasje");
  }

  const existing = await repository.getWeeklyTaskBySource(
    data.planId,
    data.taskId,
  );

  if (existing) {
    throw new Error("Oppgaven finnes allerede i denne ukeplanen");
  }

  return repository.assignWeeklyTask({
    planId: data.planId,
    taskId: data.taskId,
    userId: data.userId,
    title: source.title,
    description: source.description,
  });
}

export async function updateWeeklyTask(
  actorId: number,
  itemId: number,
  data: {
    userId?: number;
    description?: string | null;
  },
) {
  requireValidId(itemId, "Ugyldig oppgave-ID");

  const item = await repository.getWeeklyTaskItemById(itemId);

  if (!item || item.planId === null) {
    throw new Error("Oppgaven finnes ikke i en ukeplan");
  }

  const plan = await requireEditablePlan(item.planId);

  await requireStudentOnFloor(actorId, plan.floorId);

  if (item.status !== "todo") {
    throw new Error("Fullført oppgave kan ikke endres");
  }

  if (data.userId !== undefined) {
    await requireStudentOnFloor(data.userId, plan.floorId);
  }

  return repository.updateWeeklyTask(itemId, data);
}

export async function deleteWeeklyTask(actorId: number, itemId: number) {
  requireValidId(itemId, "Ugyldig oppgave-ID");

  const item = await repository.getWeeklyTaskItemById(itemId);

  if (!item || item.planId === null) {
    throw new Error("Oppgaven finnes ikke i en ukeplan");
  }

  const plan = await requireEditablePlan(item.planId);

  await requireStudentOnFloor(actorId, plan.floorId);

  if (item.status !== "todo") {
    throw new Error("Fullført oppgave kan ikke slettes");
  }

  return repository.deleteWeeklyTask(itemId);
}

export async function completeWeeklyTask(itemId: number, studentId: number) {
  requireValidId(itemId, "Ugyldig oppgave-ID");

  const item = await repository.getWeeklyTaskItemById(itemId);

  if (!item || item.planId === null) {
    throw new Error("Oppgaven finnes ikke i en ukeplan");
  }

  const plan = await requireEditablePlan(item.planId);

  await requireStudentOnFloor(studentId, plan.floorId);

  if (item.userId !== studentId) {
    throw new Error("Du kan bare fullføre dine egne oppgaver");
  }

  if (item.status !== "todo") {
    throw new Error("Oppgaven er allerede fullført");
  }

  const completed = await repository.completeWeeklyTask(itemId, studentId);

  if (!completed) {
    throw new Error("Oppgaven kunne ikke fullføres");
  }

  return completed;
}

export async function reviewWeeklyPlan(
  planId: number,
  reviewerId: number,
  approved: boolean,
  report: string,
) {
  requireValidId(planId, "Ugyldig ukeplan-ID");
  requireValidId(reviewerId, "Ugyldig ansatt-ID");

  if (typeof approved !== "boolean") {
    throw new Error("Ugyldig vurdering");
  }

  if (typeof report !== "string" || !report.trim()) {
    throw new Error("Ansattrapport er påkrevd");
  }

  const reviewer = await repository.getUserById(reviewerId);

  if (!reviewer || reviewer.role !== "ansatt") {
    throw new Error("Bare ansatte kan vurdere etasjer");
  }

  const plan = await repository.getWeeklyPlanById(planId);

  if (!plan) {
    throw new Error("Ukeplanen finnes ikke");
  }

  if (reviewer.floorId !== plan.floorId) {
    throw new Error("Du kan bare vurdere din egen etasje");
  }

  if (plan.reviewStatus !== "pending") {
    throw new Error("Ukeplanen er allerede vurdert");
  }

  const reviewed = await repository.reviewWeeklyPlan(
    planId,
    reviewerId,
    approved,
    report.trim(),
  );

  if (!reviewed) {
    throw new Error("Ukeplanen kunne ikke vurderes");
  }

  return reviewed;
}

function distributeTasksRandomly<T>(
  tasks: T[],
  studentIds: number[],
): Array<{ task: T; studentId: number }> {
  if (studentIds.length === 0) {
    throw new Error("Ingen studenter finnes i denne etasjen");
  }

  const shuffledTasks = [...tasks];
  const shuffledStudents = [...studentIds];

  function shuffle<TItem>(items: TItem[]) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  shuffle(shuffledTasks);
  shuffle(shuffledStudents);

  return shuffledTasks.map((task, index) => ({
    task,
    studentId: shuffledStudents[index % shuffledStudents.length],
  }));
}
