//En test for ansatt-service.ts, den tester funksjonene reviewFloorReport og getFloorReport. 
//Vi bruker vitest for å mocke databasekallene og sjekke at funksjonene oppfører seg som 
// forventet under ulike scenarier. 
import { describe, it, expect, vi, beforeEach } from "vitest";
import { reviewFloorReport, getFloorReport } from "../ansatt-service";

const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  values: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: mocks.limit,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: mocks.values,
    })),
  },
}));

describe("Ansatt service", () => { 
  const week = "2026-11-02";
  const checks = [true, true, true, true, true];

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limit.mockReset();
  });

  it("avviser ugyldig etasje-ID", async () => { 
    await expect(
      getFloorReport(0, week)
    ).rejects.toThrow("Ugyldig etasje");
  });

  it("avviser rapport fra student", async () => {
    mocks.limit
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{ id: 10, role: "student" }]);

    await expect(
      reviewFloorReport(2, week, 10, true, checks, "Godkjent")
    ).rejects.toThrow("Bare ansatte kan vurdere rapporter");

    expect(mocks.values).not.toHaveBeenCalled();
  });

  it("avviser ugyldige avkrysninger", async () => {
    mocks.limit
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{ id: 20, role: "ansatt" }]);

    await expect(
      reviewFloorReport(2, week, 20, true, [true], "Godkjent")
    ).rejects.toThrow("Ugyldige avkrysninger");

    expect(mocks.values).not.toHaveBeenCalled();
  });

  it("lar ansatt godkjenne rapport", async () => {
    mocks.limit
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{ id: 20, role: "ansatt" }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2 }])
      .mockResolvedValueOnce([{
        checks: JSON.stringify(checks),
        comment: "Godkjent",
        status: "approved",
        reviewedBy: 20,
      }]);

    const result = await reviewFloorReport(
      2, week, 20, true, checks, "Godkjent"
    );

    expect(mocks.values).toHaveBeenCalledWith({
      floorId: 2,
      weekStart: week,
      checks: JSON.stringify(checks),
      comment: "Godkjent",
      status: "approved",
      reviewedBy: 20,
    });

    expect(result.status).toBe("approved");
  });
});