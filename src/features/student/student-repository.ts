import { eq, and, asc } from "drizzle-orm";
import { db } from "@/db";
import { buildings, floors, users } from "@/db/schema";

export function createStudentRepository(database: typeof db) {
  return {
    async groupForStudent(buildingId: number, floorId: number) {
      const [building] = await database
        .select({ id: buildings.id, name: buildings.name })
        .from(buildings)
        .where(eq(buildings.id, buildingId))
        .limit(1);
      const [floor] = await database
        .select({ id: floors.id, number: floors.number })
        .from(floors)
        .where(and(eq(floors.id, floorId), eq(floors.buildingId, buildingId)))
        .limit(1);
      if (!building || !floor) return null;
      const members = await database
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          name: users.name,
        })
        .from(users)
        .where(
          and(eq(users.buildingId, buildingId), eq(users.floorId, floorId)),
        )
        .orderBy(asc(users.name));
      return {
        building: building.name,
        floor: floor.number,
        groupKey: `${buildingId}-${floorId}`,
        members: members.map((member) => ({
          id: member.id,
          name:
            [member.firstName, member.lastName].filter(Boolean).join(" ") ||
            member.name,
        })),
      };
    },
  };
}
export const studentRepository = createStudentRepository(db);
