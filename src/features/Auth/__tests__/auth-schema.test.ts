
import { describe, it, expect } from "vitest";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../auth-schema";

describe("Auth validering", () => {
  describe("Registrering", () => {
    const validUser = {
      firstName: "abdi",
      lastName: "rahman",
      email: "abdi@test.com",
      password: "test1234",
      confirmPassword: "test1234",
      buildingId: 1,
      floorId: 2,
    };

    it("godtar gyldig registrering", () => {
      const result = registerSchema.safeParse(validUser);

      expect(result.success).toBe(true);
    });

    it("avviser passord under 8 tegn", () => {
      const result = registerSchema.safeParse({
        ...validUser,
        password: "123",
        confirmPassword: "123",
      });

      expect(result.success).toBe(false);
    });

    it("avviser passord som ikke matcher", () => {
      const result = registerSchema.safeParse({
        ...validUser,
        confirmPassword: "test12345",
      });

      expect(result.success).toBe(false);
    });

    it("avviser ugyldig e-post", () => {
      const result = registerSchema.safeParse({
        ...validUser,
        email: "ugyldig-epost",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Innlogging", () => {
    it("godtar gyldig e-post og passord", () => {
      const result = loginSchema.safeParse({
        email: "abdi@test.com",
        password: "test1234",
      });

      expect(result.success).toBe(true);
    });

    it("avviser tomt passord", () => {
      const result = loginSchema.safeParse({
        email: "abdi@test.com",
        password: "",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Endring av passord", () => {
    it("godtar gyldig passordendring", () => {
      const result = changePasswordSchema.safeParse({
        oldPassword: "test1234",
        newPassword: "gruppew08",
        confirmPassword: "gruppew08",
      });

      expect(result.success).toBe(true);
    });

    it("avviser ulike nye passord", () => {
      const result = changePasswordSchema.safeParse({
        oldPassword: "test1234",
        newPassword: "gruppew08",
        confirmPassword: "gruppew09",
      });

      expect(result.success).toBe(false);
    });

    it("avviser for kort nytt passord", () => {
      const result = changePasswordSchema.safeParse({
        oldPassword: "test1234",
        newPassword: "123",
        confirmPassword: "123",
      });

      expect(result.success).toBe(false);
    });
  });
});
