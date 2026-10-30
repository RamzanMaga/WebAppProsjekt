export type Building = {
  id: number;
  name: string;
};

export type Floor = {
  id: number;
  buildingId: number;
  number: number;
};

export type FixedTask = {
  title: string;
  description: string;
};

export type FloorReport = {
  floorId: number;
  weekStart: string;
  tasks: FixedTask[];
  checks: boolean[];
  comment: string;
  status: string;
  reviewedBy: number | null;
};

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string | { message: string };
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });

  const result = (await response.json()) as ApiResult<T>;

  if (!response.ok || !result.ok) {
    const message =
      typeof result.error === "string"
        ? result.error
        : (result.error?.message ?? "Noe gikk galt");

    throw new Error(message);
  }

  return result.data as T;
}

export function getLocations() {
  return request<{
    buildings: Building[];
    floors: Floor[];
  }>("/api/v1/auth/locations");
}

export function getFloorReport(floorId: number, weekStart: string) {
  const params = new URLSearchParams({
    floorId: String(floorId),
    weekStart,
  });

  return request<FloorReport>(`/api/ansatt/reports?${params.toString()}`);
}

export function reviewFloorReport(
  floorId: number,
  weekStart: string,
  approved: boolean,
  checks: boolean[],
  comment: string,
) {
  return request<FloorReport>("/api/ansatt/reports/review", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      floorId,
      weekStart,
      approved,
      checks,
      comment,
    }),
  });
}
