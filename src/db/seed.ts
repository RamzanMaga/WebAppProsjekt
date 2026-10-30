import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { buildings, floors } from "./schema";
import { users } from "./schema";
import { hashPassword } from "../features/Auth/auth-crypto";

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
    floors: Array.from({ length: 16 }, (_, index) => index + 1),
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
      throw new Error(`Kunne ikke finne ${buildingData.name}`);
    }

    for (const floorNumber of buildingData.floors) {
      const [existingFloor] = await db
        .select()
        .from(floors)
        .where(
          and(
            eq(floors.buildingId, building.id),
            eq(floors.number, floorNumber),
          ),
        );

      if (!existingFloor) {
        await db.insert(floors).values({
          buildingId: building.id,
          number: floorNumber,
        });
      }
    }

    console.log(`${buildingData.name}: ${buildingData.floors.length} etasjer`);
  }

  // Opprett ansatt
  const email = "ansatt@test.no";

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!existingUser) {
    const [building] = await db
      .select()
      .from(buildings)
      .where(eq(buildings.name, "Bygg A"));

    if (!building) {
      throw new Error("Bygg A finnes ikke");
    }

    const [floor] = await db
      .select()
      .from(floors)
      .where(and(eq(floors.buildingId, building.id), eq(floors.number, 1)));

    if (!floor) {
      throw new Error("Etasje 1 finnes ikke");
    }

    const password = "ansatt123";

    if (!password || password.length < 8) {
      throw new Error("SEED_ANSATT_PASSWORD må være minst 8 tegn");
    }

    await db.insert(users).values({
      name: "Test Ansatt",
      firstName: "Test",
      lastName: "Ansatt",
      email,
      passwordHash: await hashPassword(password),
      role: "ansatt",
      buildingId: building.id,
      floorId: floor.id,
    });

    console.log("Testansatt opprettet");
  }

  return Response.json({
    ok: true,
    message: "Bygninger og etasjer er lagt inn",
  });
});
