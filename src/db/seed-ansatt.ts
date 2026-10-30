import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../features/Auth/auth-crypto";

const TEST_EMAIL = "ansatt@test.no";
const TEST_PASSWORD = "AnsattTest123!";

export async function seedAnsatt() {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, TEST_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log("Ansatt testkonto finnes allerede.");
    return;
  }

  await db.insert(users).values({
    name: "Test Ansatt",
    firstName: "Test",
    lastName: "Ansatt",
    email: TEST_EMAIL,
    passwordHash: await hashPassword(TEST_PASSWORD),
    role: "ansatt",
  });

  console.log("Ansatt testkonto opprettet.");
}
