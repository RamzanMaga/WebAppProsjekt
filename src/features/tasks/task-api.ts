const BASE_URL = "/api/tasks";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  floorId: number | null;
  userId: number;
};

export type WeeklyTaskItem = {
  id: number;
  planId: number | null;
  taskId: string;
  userId: number;
  titles: string;
  studentFirstName: string | null;
  studentLastName: string | null;
  description: string | null;
  status: string;
  completedAt: string | null;
};

export type WeeklyPlan = {
  id: number;
  floorId: number;
  weekStart: string;
  reviewStatus: string;
  reviewedBy: number | null;
  ansattRapport: string | null;
  reviewedAt: string | null;
};

export type WeeklyPlanWithItems = WeeklyPlan & {
  items: WeeklyTaskItem[];
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);

    let message = "Noe gikk galt";

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      message = body.error;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(BASE_URL);

  return handleResponse<Task[]>(response);
}

export async function createTask(data: {
  title: string;
  description?: string;
}): Promise<Task> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
  },
): Promise<Task> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  return handleResponse<{ success: boolean }>(response);
}

export async function getWeeklyPlan(
  weekStart: string,
): Promise<WeeklyPlanWithItems | null> {
  const response = await fetch(
    `${BASE_URL}/weekly/${encodeURIComponent(weekStart)}`,
  );

  return handleResponse<WeeklyPlanWithItems | null>(response);
}

export async function createWeeklyPlan(weekStart: string): Promise<WeeklyPlan> {
  const response = await fetch(`${BASE_URL}/weekly`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ weekStart }),
  });

  return handleResponse<WeeklyPlan>(response);
}

export async function assignWeeklyTask(data: {
  planId: number;
  taskId: string;
  userId: number;
}): Promise<WeeklyTaskItem> {
  const response = await fetch(`${BASE_URL}/weekly-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<WeeklyTaskItem>(response);
}

export async function updateWeeklyTask(
  itemId: number,
  data: {
    userId?: number;
    description?: string | null;
  },
): Promise<WeeklyTaskItem> {
  const response = await fetch(`${BASE_URL}/weekly-items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<WeeklyTaskItem>(response);
}

export async function deleteWeeklyTask(
  itemId: number,
): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_URL}/weekly-items/${itemId}`, {
    method: "DELETE",
  });

  return handleResponse<{ success: boolean }>(response);
}

export async function completeWeeklyTask(
  itemId: number,
): Promise<WeeklyTaskItem> {
  const response = await fetch(`${BASE_URL}/weekly-items/${itemId}/complete`, {
    method: "PATCH",
  });

  return handleResponse<WeeklyTaskItem>(response);
}

export async function reviewWeeklyPlan(
  planId: number,
  data: {
    approved: boolean;
    report: string;
  },
): Promise<WeeklyPlan> {
  const response = await fetch(`${BASE_URL}/weekly-plans/${planId}/review`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<WeeklyPlan>(response);
}
