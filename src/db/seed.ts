
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { buildings, floors } from "./schema";

const buildingsData = [
  {
    name: "Bygg A",
    floors: [1, 2, 3, 4],
  },
  {
    name: "Bygg B",
    floors: [1, 2, 3, 4],
  },
  {
    name: "Bygg C",
    floors: [1, 2, 3, 4],
  },
  {
    name: "Bygg D",
    floors: [1, 2, 3, 4],
  },
  {
    name: "Tårnet",
    floors: Array.from(
      { length: 16 },
      (_, index) => index + 1
    ),
  },
  {
    name: "Stadion",
    floors: [1, 2, 3, 4, 5],
  },
];

export default defineScript(async ({ env }) => {
  const db = drizzle(env.DB);

  for (const buildingData of buildingsData) {
    await db
      .insert(buildings)
      .values({
        name: buildingData.name,
      })
      .onConflictDoNothing();

    const [building] = await db
      .select()
      .from(buildings)
      .where(eq(buildings.name, buildingData.name));

    if (!building) {
      throw new Error(
        `Kunne ikke finne ${buildingData.name}`
      );
    }

    for (const floorNumber of buildingData.floors) {
      const [existingFloor] = await db
        .select()
        .from(floors)
        .where(
          and(
            eq(floors.buildingId, building.id),
            eq(floors.number, floorNumber)
          )
        );

      if (!existingFloor) {
        await db.insert(floors).values({
          buildingId: building.id,
          number: floorNumber,
        });
      }
    }

    console.log(
      `${buildingData.name}: ${buildingData.floors.length} etasjer`
    );
  }

  return Response.json({
    ok: true,
    message: "Bygninger og etasjer er lagt inn",
  });
});
