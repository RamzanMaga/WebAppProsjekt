import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, buildings, floors, sessions } from "@/db/schema";
export function createAuthRepository(database: typeof db) {
  return {
    async findByEmail(email: string) {
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return user ?? null;
    },
    async locations() {
      const [buildingRows, floorRows] = await Promise.all([
        database.select().from(buildings),
        database.select().from(floors),
      ]);
      return { buildings: buildingRows, floors: floorRows };
    },
    async floorBelongsToBuilding(floorId: number, buildingId: number) {
      const [floor] = await database
        .select()
        .from(floors)
        .where(and(eq(floors.id, floorId), eq(floors.buildingId, buildingId)))
        .limit(1);
      return Boolean(floor);
    },
    async createUser(data: {
      firstName: string;
      lastName: string;
      email: string;
      passwordHash: string;
      buildingId: number;
      floorId: number;
    }) {
      const [user] = await database
        .insert(users)
        .values({
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash: data.passwordHash,
          buildingId: data.buildingId,
          floorId: data.floorId,
        })
        .returning();
      return user;
    },
    async saveSession(hash: string, userId: number, expiresAt: number) {
      await database
        .insert(sessions)
        .values({ tokenHash: hash, userId, expiresAt });
    },
    async userForSession(hash: string, now: number) {
      const [session] = await database
        .select()
        .from(sessions)
        .where(eq(sessions.tokenHash, hash))
        .limit(1);
      if (!session || session.expiresAt <= now) return null;
      const [user] = await database
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      return user ?? null;
    },
  async updatePassword(userId: number, passwordHash: string) {
    await database
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));
    },
    async deleteSession(hash: string) {
      await database.delete(sessions).where(eq(sessions.tokenHash, hash));
    },
  };
}
export const repository = createAuthRepository(db);
