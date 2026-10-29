import { service as authService } from "@/features/Auth/auth-service";
import { studentRepository } from "./student-repository";

export async function getMyFloorGroup(token: string | null) {
  const auth = await authService.me(token);
  if (!auth.ok) return auth;
  const { buildingId, floorId } = auth.data;
  if (buildingId == null || floorId == null) {
    return {
      ok: false as const,
      error: {
        code: "400",
        message: "Brukeren er ikke knyttet til en bygning og etasje",
      },
    };
  }
  try {
    const group = await studentRepository.groupForStudent(buildingId, floorId);
    if (!group)
      return {
        ok: false as const,
        error: { code: "404", message: "Fant ikke etasjegruppen" },
      };
    return {
      ok: true as const,
      data: {
        ...group,
        currentUserId: auth.data.id,
        firstName: auth.data.firstName,
      },
    };
  } catch (error) {
    console.error("Kunne ikke hente etasjegruppen", error);
    return {
      ok: false as const,
      error: { code: "500", message: "Kunne ikke hente etasjegruppen" },
    };
  }
}
