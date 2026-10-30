import { randomBytes, pbkdf2Sync } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const EMAIL = "ansatt@gmail.com";
const PASSWORD = "ansatt123";

const salt = randomBytes(16);
const hash = pbkdf2Sync(PASSWORD, salt, 310000, 32, "sha256");

const passwordHash = `pbkdf2-sha256:310000:${salt.toString("hex")}:${hash.toString("hex")}`;

const sql = `
INSERT INTO users (
  name,
  first_name,
  last_name,
  email,
  password_hash,
  role
)
VALUES (
  'Test Ansatt',
  'Test',
  'Ansatt',
  '${EMAIL}',
  '${passwordHash}',
  'ansatt'
)
ON CONFLICT(email) DO NOTHING;
`;

const sqlFile = join(process.cwd(), "seed-ansatt-temp.sql");

try {
  writeFileSync(sqlFile, sql, "utf8");

  const wrangler =
    process.platform === "win32"
      ? join(process.cwd(), "node_modules", ".bin", "wrangler.cmd")
      : join(process.cwd(), "node_modules", ".bin", "wrangler");

  execFileSync(
    wrangler,
    ["d1", "execute", "webapp-db", "--local", `--file=${sqlFile}`],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  console.log("\nAnsatt konto er klar");
  console.log(`E-post: ${EMAIL}`);
  console.log(`Passord: ${PASSWORD}`);
} finally {
  try {
    unlinkSync(sqlFile);
  } catch {
  }
}
