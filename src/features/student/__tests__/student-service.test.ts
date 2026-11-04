
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMyFloorGroup } from "../student-service";
import { studentRepository } from "../student-repository";
import { service as authService } from "../../Auth/auth-service";

vi.mock("../../Auth/auth-service", () => ({
  service: { me: vi.fn() },
}));

vi.mock("../student-repository", () => ({
  studentRepository: {
    groupForStudent: vi.fn(),
  },
}));

describe("Student service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("avviser bruker som ikke er innlogget", async () => {
    vi.mocked(authService.me).mockResolvedValue({
      ok: false,
      error: { code: "401", message: "Ikke innlogget" },
    });

    const result = await getMyFloorGroup(null);

    expect(result.ok).toBe(false);
    expect(studentRepository.groupForStudent).not.toHaveBeenCalled();
  });

  it("avviser bruker uten bygning eller etasje", async () => {
    vi.mocked(authService.me).mockResolvedValue({
      ok: true,
      data: { id: 1, buildingId: null, floorId: null },
    } as never);

    const result = await getMyFloorGroup("token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("400");
    }
  });

  it("henter studentens riktige etasjegruppe", async () => {
    vi.mocked(authService.me).mockResolvedValue({
      ok: true,
      data: {
        id: 1,
        firstName: "abdi",
        buildingId: 1,
        floorId: 2,
      },
    } as never);

    vi.mocked(studentRepository.groupForStudent).mockResolvedValue({
      building: "Bygning A",
      floor: 2,
      groupKey: "1-2",
      members: [{ id: 1, name: "abdi rahman" }],
    });

    const result = await getMyFloorGroup("token");

    expect(result.ok).toBe(true);
    expect(studentRepository.groupForStudent)
      .toHaveBeenCalledWith(1, 2);
  });

  it("avviser når etasjegruppen ikke finnes", async () => {
    vi.mocked(authService.me).mockResolvedValue({
      ok: true,
      data: { id: 1, buildingId: 1, floorId: 2 },
    } as never);

    vi.mocked(studentRepository.groupForStudent)
      .mockResolvedValue(null);

    const result = await getMyFloorGroup("token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("404");
    }
  });
});
