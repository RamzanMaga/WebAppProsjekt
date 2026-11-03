
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthService } from "../auth-service";
import { repository } from "../auth-repository";
import * as crypto from "../auth-crypto";

vi.mock("../auth-repository", () => ({
  repository: {
    findByEmail: vi.fn(),
    floorBelongsToBuilding: vi.fn(),
    createUser: vi.fn(),
    saveSession: vi.fn(),
    userForSession: vi.fn(),
    updatePassword: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

vi.mock("../auth-crypto", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  newSessionToken: vi.fn(),
  tokenHash: vi.fn(),
}));

describe("Auth service", () => {
  const service = createAuthService(repository);
  const token = "a".repeat(64);

  const user = {
    id: 1,
    name: "abdi rahman",
    firstName: "abdi",
    lastName: "rahman",
    email: "abdi@test.com",
    passwordHash: "hashed-password",
    buildingId: 1,
    floorId: 2,
    role: "student",
  };

  const registration = {
    firstName: "abdi",
    lastName: "rahman",
    email: "abdi@test.com",
    password: "test1234",
    confirmPassword: "test1234",
    buildingId: 1,
    floorId: 2,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(crypto.hashPassword)
      .mockResolvedValue("hashed-password");

    vi.mocked(crypto.verifyPassword)
      .mockResolvedValue(true);

    vi.mocked(crypto.newSessionToken)
      .mockReturnValue(token);

    vi.mocked(crypto.tokenHash)
      .mockResolvedValue("hashed-token");
  });

  describe("registrering", () => {
    it("registrerer en gyldig bruker", async () => {
      vi.mocked(repository.findByEmail)
        .mockResolvedValue(null as never);

      vi.mocked(repository.floorBelongsToBuilding)
        .mockResolvedValue(true);

      vi.mocked(repository.createUser)
        .mockResolvedValue(user as never);

      const result = await service.register(registration);

      expect(result.ok).toBe(true);
      expect(repository.createUser).toHaveBeenCalled();
    });

    it("avviser e-post som allerede finnes", async () => {
      vi.mocked(repository.findByEmail)
        .mockResolvedValue(user as never);

      const result = await service.register(registration);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("409");
      }
    });
  });

  describe("innlogging", () => {
    it("logger inn med riktig passord", async () => {
      vi.mocked(repository.findByEmail)
        .mockResolvedValue(user as never);

      const result = await service.login({
        email: "abdi@test.com",
        password: "test1234",
      });

      expect(result.ok).toBe(true);
      expect(repository.saveSession).toHaveBeenCalled();
    });

    it("avviser feil passord", async () => {
      vi.mocked(repository.findByEmail)
        .mockResolvedValue(user as never);

      vi.mocked(crypto.verifyPassword)
        .mockResolvedValue(false);

      const result = await service.login({
        email: "abdi@test.com",
        password: "feilpassord",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("401");
      }
    });
  });

  describe("innlogget bruker", () => {
    it("avviser ugyldig token", async () => {
      const result = await service.me(null);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("401");
      }
    });
  });

  describe("Utlogging", () => {
    it("logger ut en bruker", async () => {
      const result = await service.logout(token);

      expect(result.ok).toBe(true);
      expect(repository.deleteSession)
        .toHaveBeenCalledWith("hashed-token");
    });
  });

  describe("Endring av passord", () => {
    const passwords = {
      oldPassword: "test1234",
      newPassword: "gruppew08",
      confirmPassword: "gruppew08",
    };

    it("endrer passord med riktig gammelt passord", async () => {
      vi.mocked(repository.userForSession)
        .mockResolvedValue(user as never);

      const result = await service.changePassword(
        token,
        passwords,
      );

      expect(result.ok).toBe(true);
      expect(repository.updatePassword)
        .toHaveBeenCalledWith(1, "hashed-password");
    });

    it("avviser feil gammelt passord", async () => {
      vi.mocked(repository.userForSession)
        .mockResolvedValue(user as never);

      vi.mocked(crypto.verifyPassword)
        .mockResolvedValue(false);

      const result = await service.changePassword(
        token,
        passwords,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("400");
      }

      expect(repository.updatePassword)
        .not.toHaveBeenCalled();
    });
  });
});
