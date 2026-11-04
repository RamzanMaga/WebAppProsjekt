
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "../task-service";
import * as repository from "../task-repository";

vi.mock("../task-repository", () => ({
  createTask: vi.fn(),
  getWeeklyTaskItemById: vi.fn(),
  getWeeklyPlanById: vi.fn(),
  getUserById: vi.fn(),
  completeWeeklyTask: vi.fn(),
  reviewWeeklyPlan: vi.fn(),
}));

describe("Task service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Oppgaver", () => {
    it("avviser oppgave uten tittel", async () => {
      await expect(
        service.createTask({ title: "", userId: 10 })
      ).rejects.toThrow("Tittel er påkrevd");
    });

    it("fjerner mellomrom fra tittelen", async () => {
      await service.createTask({
        title: "  Vaske gulv  ",
        userId: 10,
      });

      expect(repository.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Vaske gulv" })
      );
    });
  });

  describe("Ukeplan", () => {
    it("avviser ugyldig uke", async () => {
      await expect(
        service.createWeeklyPlan(2, "2026-11-03")
      ).rejects.toThrow("Ugyldig uke");
    });
  });

  describe("Fullføring av oppgaver", () => {
    it("avviser fullføring av andres oppgaver", async () => {
      vi.mocked(repository.getWeeklyTaskItemById)
        .mockResolvedValue({
          id: 1, planId: 1, userId: 10, status: "todo"
        } as never);

      vi.mocked(repository.getWeeklyPlanById)
        .mockResolvedValue({
          id: 1, floorId: 2, reviewStatus: "pending"
        } as never);

      vi.mocked(repository.getUserById)
        .mockResolvedValue({
          id: 11, role: "student", floorId: 2
        });

      await expect(
        service.completeWeeklyTask(1, 11)
      ).rejects.toThrow("Du kan bare fullføre dine egne oppgaver");
    });
  });

  describe("Godkjenning", () => {
    it("avviser godkjenning fra student", async () => {
      vi.mocked(repository.getUserById)
        .mockResolvedValue({
          id: 10, role: "student", floorId: 2
        });

      await expect(
        service.reviewWeeklyPlan(1, 10, true, "Godkjent")
      ).rejects.toThrow("Bare ansatte kan vurdere etasjer");
    });

    it("lar ansatt godkjenne ukeplan", async () => {
      vi.mocked(repository.getUserById)
        .mockResolvedValue({
          id: 20, role: "ansatt", floorId: 2
        });

      vi.mocked(repository.getWeeklyPlanById)
        .mockResolvedValue({
          id: 1, floorId: 2, reviewStatus: "pending"
        } as never);

      vi.mocked(repository.reviewWeeklyPlan)
        .mockResolvedValue({
          id: 1, reviewStatus: "approved"
        } as never);

      const result = await service.reviewWeeklyPlan(
        1, 20, true, "Godkjent"
      );

      expect(result.reviewStatus).toBe("approved");
    });
  });
});
