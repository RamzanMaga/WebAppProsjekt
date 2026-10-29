"use client";
import type { Result } from "@/features/auth/auth-api";

export type FloorGroup = {
  building: string;
  floor: number;
  groupKey: string;
  currentUserId: number;
  firstName: string;
  members: { id: number; name: string }[];
};

export async function getMyFloorGroup(): Promise<Result<FloorGroup>> {
  try {
    const response = await fetch("/api/v1/student/my-group", {
      credentials: "same-origin",
    });
    return (await response.json()) as Result<FloorGroup>;
  } catch {
    return {
      ok: false,
      error: { code: "500", message: "Fikk ikke kontakt med serveren" },
    };
  }
}
