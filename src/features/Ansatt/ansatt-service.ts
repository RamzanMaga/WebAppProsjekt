import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { ansattReviews, floors, users } from "@/db/schema";

export const FIXED_TASKS = [
  {
    title: "Støvsuge med tilbehør",
    description: "Inkluderer koketopp, stekebrett og kjøkkenvifte.",
  },
  {
    title: "Kjøkkenbenk",
    description: "Inkluderer veggen over benken, vask og kran.",
  },
  {
    title: "Søppel",
    description: "Skal tas ut før hver vaskesjekk.",
  },
  {
    title: "Gulv",
    description: "Skal støvsuges og vaskes.",
  },
  {
    title: "Fellesareal",
    description: "Ryddes og vaskes.",
  },
];

function validateFloorId(floorId: number) {
  if (!Number.isSafeInteger(floorId) || floorId <= 0) {
    throw new Error("Ugyldig etasje");
  }
}

function validateWeekStart(weekStart: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    throw new Error("Ugyldig uke");
  }

  const date = new Date(`${weekStart}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== weekStart ||
    date.getUTCDay() !== 1
  ) {
    throw new Error("Uken må starte på en mandag");
  }
}

async function requireFloor(floorId: number) {
  validateFloorId(floorId);

  const [floor] = await db
    .select({ id: floors.id })
    .from(floors)
    .where(eq(floors.id, floorId))
    .limit(1);

  if (!floor) {
    throw new Error("Etasjen finnes ikke");
  }
}

export async function getFloorReport(floorId: number, weekStart: string) {
  await requireFloor(floorId);
  validateWeekStart(weekStart);

  const [review] = await db
    .select()
    .from(ansattReviews)
    .where(
      and(
        eq(ansattReviews.floorId, floorId),
        eq(ansattReviews.weekStart, weekStart),
      ),
    )
    .limit(1);

  return {
    floorId,
    weekStart,
    tasks: FIXED_TASKS,
    checks: review
      ? (JSON.parse(review.checks) as boolean[])
      : FIXED_TASKS.map(() => false),
    comment: review?.comment ?? "",
    status: review?.status ?? "pending",
    reviewedBy: review?.reviewedBy ?? null,
  };
}

export async function reviewFloorReport(
  floorId: number,
  weekStart: string,
  reviewerId: number,
  approved: boolean,
  checks: boolean[],
  comment: string,
) {
  await requireFloor(floorId);
  validateWeekStart(weekStart);

  if (!Number.isSafeInteger(reviewerId) || reviewerId <= 0) {
    throw new Error("Ugyldig ansatt-ID");
  }

  const [reviewer] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, reviewerId))
    .limit(1);

  if (!reviewer || reviewer.role !== "ansatt") {
    throw new Error("Bare ansatte kan vurdere rapporter");
  }

  if (typeof approved !== "boolean") {
    throw new Error("Ugyldig vurdering");
  }

  if (
    !Array.isArray(checks) ||
    checks.length !== FIXED_TASKS.length ||
    !checks.every((value) => typeof value === "boolean")
  ) {
    throw new Error("Ugyldige avkrysninger");
  }

  if (typeof comment !== "string" || !comment.trim()) {
    throw new Error("Kommentar er påkrevd");
  }

  const [existing] = await db
    .select({ id: ansattReviews.id })
    .from(ansattReviews)
    .where(
      and(
        eq(ansattReviews.floorId, floorId),
        eq(ansattReviews.weekStart, weekStart),
      ),
    )
    .limit(1);

  if (existing) {
    throw new Error("Rapporten er allerede vurdert");
  }

  await db.insert(ansattReviews).values({
    floorId,
    weekStart,
    checks: JSON.stringify(checks),
    comment: comment.trim(),
    status: approved ? "approved" : "rejected",
    reviewedBy: reviewerId,
  });

  return getFloorReport(floorId, weekStart);
}
