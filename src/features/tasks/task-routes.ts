import { route } from "rwsdk/router";
import * as controller from "./task-controller";

function parsePositiveId(value: string): number | null {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function invalidIdResponse() {
  return Response.json({ error: "Ugyldig ID" }, { status: 400 });
}

function methodNotAllowed() {
  return new Response("Method Not Allowed", {
    status: 405,
  });
}

export const taskRoutes = [
  route("/api/tasks/weekly", async ({ request }) => {
    if (request.method !== "POST") {
      return methodNotAllowed();
    }

    return controller.createWeeklyPlan(request);
  }),

  route("/api/tasks/weekly/:weekStart", async ({ request, params }) => {
    if (request.method !== "GET") {
      return methodNotAllowed();
    }

    return controller.getWeeklyPlan(request, params.weekStart);
  }),

  route("/api/tasks/weekly-items", async ({ request }) => {
    if (request.method !== "POST") {
      return methodNotAllowed();
    }

    return controller.assignWeeklyTask(request);
  }),

  route(
    "/api/tasks/weekly-items/:itemId/complete",
    async ({ request, params }) => {
      if (request.method !== "PATCH") {
        return methodNotAllowed();
      }

      const itemId = parsePositiveId(params.itemId);

      if (itemId === null) {
        return invalidIdResponse();
      }

      return controller.completeWeeklyTask(request, itemId);
    },
  ),

  route("/api/tasks/weekly-items/:itemId", async ({ request, params }) => {
    const itemId = parsePositiveId(params.itemId);

    if (itemId === null) {
      return invalidIdResponse();
    }

    if (request.method === "PATCH") {
      return controller.updateWeeklyTask(request, itemId);
    }

    if (request.method === "DELETE") {
      return controller.deleteWeeklyTask(request, itemId);
    }

    return methodNotAllowed();
  }),

  route(
    "/api/tasks/weekly-plans/:planId/review",
    async ({ request, params }) => {
      if (request.method !== "PATCH") {
        return methodNotAllowed();
      }

      const planId = parsePositiveId(params.planId);

      if (planId === null) {
        return invalidIdResponse();
      }

      return controller.reviewWeeklyPlan(request, planId);
    },
  ),

  route("/api/tasks", async ({ request }) => {
    if (request.method === "GET") {
      return controller.getTasks(request);
    }

    if (request.method === "POST") {
      return controller.createTask(request);
    }

    return methodNotAllowed();
  }),

  route("/api/tasks/:id", async ({ request, params }) => {
    const id = params.id;

    if (!id || typeof id !== "string") {
      return invalidIdResponse();
    }

    if (request.method === "GET") {
      return controller.getTask(request, id);
    }

    if (request.method === "PATCH") {
      return controller.updateTask(request, id);
    }

    if (request.method === "DELETE") {
      return controller.deleteTask(request, id);
    }

    return methodNotAllowed();
  }),
];
