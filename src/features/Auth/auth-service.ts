import { registerSchema, loginSchema } from "./auth-schema";
import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  tokenHash,
} from "./auth-crypto";
import { toUserDTO } from "./auth-mapper";
import { repository } from "./auth-repository";
const SESSION_DURATION = 60 * 60 * 24 * 7;
type Failure = {
  ok: false;
  error: {
    code: "400" | "401" | "409" | "500";
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
const fail = (
  code: Failure["error"]["code"],
  message: string,
  fieldErrors?: Record<string, string[]>,
): Failure => ({ ok: false, error: { code, message, fieldErrors } });
export function createAuthService(repo: typeof repository) {
  return {
    async locations() {
      try {
        return { ok: true as const, data: await repo.locations() };
      } catch {
        return fail("500", "Kunne ikke hente bygninger og etasjer");
      }
    },
    async register(input: unknown) {
      const parsed = registerSchema.safeParse(input);
      if (!parsed.success)
        return fail(
          "400",
          "Sjekk feltene",
          Object.fromEntries(
            Object.entries(parsed.error.flatten().fieldErrors).map(
              ([key, value]) => [key, value ?? []],
            ),
          ),
        );
      const { confirmPassword: _unused, password, ...details } = parsed.data;
      try {
        if (await repo.findByEmail(details.email))
          return fail("409", "E-posten er allerede registrert");
        if (
          !(await repo.floorBelongsToBuilding(
            details.floorId,
            details.buildingId,
          ))
        )
          return fail("400", "Bygning og etasje stemmer ikke");
        const user = await repo.createUser({
          ...details,
          passwordHash: await hashPassword(password),
        });
        return { ok: true as const, data: toUserDTO(user) };
      } catch {
        return fail("500", "Registrering mislyktes. Prøv igjen.");
      }
    },
    async login(input: unknown) {
      const parsed = loginSchema.safeParse(input);
      if (!parsed.success) return fail("400", "Oppgi gyldig e-post og passord");
      try {
        const user = await repo.findByEmail(parsed.data.email);
        if (
          !user ||
          !(await verifyPassword(parsed.data.password, user.passwordHash))
        )
          return fail("401", "Feil e-post eller passord");
        const token = newSessionToken();
        await repo.saveSession(
          await tokenHash(token),
          user.id,
          Math.floor(Date.now() / 1000) + SESSION_DURATION,
        );
        return { ok: true as const, data: { user: toUserDTO(user), token } };
      } catch {
        return fail("500", "Innlogging mislyktes. Prøv igjen.");
      }
    },
    async me(token: string | null) {
      if (!token || !/^[0-9a-f]{64}$/.test(token))
        return fail("401", "Ikke innlogget");
      try {
        const user = await repo.userForSession(
          await tokenHash(token),
          Math.floor(Date.now() / 1000),
        );
        if (!user) return fail("401", "Økten er utløpt");
        return { ok: true as const, data: toUserDTO(user) };
      } catch {
        return fail("500", "Kunne ikke sjekke økten");
      }
    },
    async logout(token: string | null) {
      try {
        if (token && /^[0-9a-f]{64}$/.test(token))
          await repo.deleteSession(await tokenHash(token));
      } catch {
        return fail("500", "Utlogging mislyktes");
      }
      return { ok: true as const, data: null };
    },
  };
}
export const service = createAuthService(repository);
