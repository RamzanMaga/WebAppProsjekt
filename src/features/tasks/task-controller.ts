import { cookieToken } from "../auth/auth-controller";
import { service as authService } from "../auth/auth-service";
import * as service from "./task-service";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Ukjent feil";

  return Response.json({ error: message }, { status: 400 });
}

async function getAuthenticatedUser(request: Request) {
  const result = await authService.me(cookieToken(request));

  if (!result.ok) {
    return null;
  }

  return result.data;
}

function unauthorizedResponse() {
  return Response.json({ error: "Du må være logget inn" }, { status: 401 });
}

function forbiddenResponse() {
  return Response.json(
    { error: "Du har ikke tilgang til denne handlingen" },
    { status: 403 },
  );
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getTasks(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    const allTasks = await service.getAllTasks();

    return Response.json(
      allTasks.filter((task) => task.floorId === user.floorId),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getTask(request: Request, id: string) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    const task = await service.getTaskById(id);

    if (!task || task.floorId !== user.floorId) {
      return Response.json({ error: "Oppgave ikke funnet" }, { status: 404 });
    }

    return Response.json(task);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function createTask(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student" || user.floorId == null) {
      return forbiddenResponse();
    }

    const body = await readJson(request);

    if (!isObject(body) || typeof body.title !== "string") {
      throw new Error("Ugyldig oppgavedata");
    }

    const task = await service.createTask({
      title: body.title,
      userId: user.id,
      floorId: user.floorId,
      description:
        typeof body.description === "string" ? body.description : undefined,
    });

    return Response.json(task, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function updateTask(request: Request, id: string) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student") {
      return forbiddenResponse();
    }

    const existing = await service.getTaskById(id);

    if (!existing || existing.floorId !== user.floorId) {
      return Response.json({ error: "Oppgave ikke funnet" }, { status: 404 });
    }

    const body = await readJson(request);

    if (!isObject(body)) {
      throw new Error("Ugyldig oppgavedata");
    }

    const data: {
      title?: string;
      description?: string;
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string") {
        throw new Error("Ugyldig tittel");
      }

      data.title = body.title;
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        throw new Error("Ugyldig beskrivelse");
      }

      data.description = body.description;
    }

    const task = await service.updateTask(id, data);

    return Response.json(task);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function deleteTask(request: Request, id: string) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student") {
      return forbiddenResponse();
    }

    const existing = await service.getTaskById(id);

    if (!existing || existing.floorId !== user.floorId) {
      return Response.json({ error: "Oppgave ikke funnet" }, { status: 404 });
    }

    const task = await service.deleteTask(id);

    if (!task) {
      return Response.json({ error: "Oppgave ikke funnet" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getWeeklyPlan(request: Request, weekStart: string) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.floorId == null) {
      return forbiddenResponse();
    }

    const plan = await service.getWeeklyPlan(user.floorId, weekStart);

    return Response.json(plan);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function createWeeklyPlan(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student" || user.floorId == null) {
      return forbiddenResponse();
    }

    const body = await readJson(request);

    if (!isObject(body) || typeof body.weekStart !== "string") {
      throw new Error("Ugyldig uke");
    }

    const plan = await service.createWeeklyPlan(user.floorId, body.weekStart);

    return Response.json(plan, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function assignWeeklyTask(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student") {
      return forbiddenResponse();
    }

    const body = await readJson(request);

    if (
      !isObject(body) ||
      typeof body.planId !== "number" ||
      typeof body.taskId !== "string" ||
      typeof body.userId !== "number"
    ) {
      throw new Error("Ugyldig oppgavefordeling");
    }

    const item = await service.assignWeeklyTask(user.id, {
      planId: body.planId,
      taskId: body.taskId,
      userId: body.userId,
    });

    return Response.json(item, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function updateWeeklyTask(request: Request, itemId: number) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student") {
      return forbiddenResponse();
    }

    const body = await readJson(request);

    if (!isObject(body)) {
      throw new Error("Ugyldig oppgavedata");
    }

    const data: {
      userId?: number;
      description?: string | null;
    } = {};

    if (body.userId !== undefined) {
      if (typeof body.userId !== "number") {
        throw new Error("Ugyldig student-ID");
      }

      data.userId = body.userId;
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== "string") {
        throw new Error("Ugyldig beskrivelse");
      }

      data.description = body.description;
    }

    const item = await service.updateWeeklyTask(user.id, itemId, data);

    return Response.json(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function deleteWeeklyTask(request: Request, itemId: number) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student") {
      return forbiddenResponse();
    }

    await service.deleteWeeklyTask(user.id, itemId);

    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function completeWeeklyTask(request: Request, itemId: number) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "student") {
      return forbiddenResponse();
    }

    const item = await service.completeWeeklyTask(itemId, user.id);

    return Response.json(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function reviewWeeklyPlan(request: Request, planId: number) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== "ansatt") {
      return forbiddenResponse();
    }

    const body = await readJson(request);

    if (
      !isObject(body) ||
      typeof body.approved !== "boolean" ||
      typeof body.report !== "string"
    ) {
      throw new Error("Ugyldig vurdering");
    }

    const plan = await service.reviewWeeklyPlan(
      planId,
      user.id,
      body.approved,
      body.report,
    );

    return Response.json(plan);
  } catch (error) {
    return errorResponse(error);
  }
}
