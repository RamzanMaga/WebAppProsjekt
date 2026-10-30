import { service as authService } from "../Auth/auth-service";
import { cookieToken } from "../Auth/auth-controller";
import * as ansattService from "./ansatt-service";

async function requireAnsatt(request: Request) {
  const result = await authService.me(cookieToken(request));

  if (!result.ok || result.data.role !== "ansatt") {
    return null;
  }

  return result.data;
}

function errorResponse(error: unknown) {
  return Response.json(
    {
      ok: false,
      error: error instanceof Error ? error.message : "Ukjent feil",
    },
    { status: 400 },
  );
}

export async function getFloorReport(request: Request) {
  try {
    const user = await requireAnsatt(request);

    if (!user) {
      return Response.json(
        { ok: false, error: "Ingen tilgang" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);

    const floorId = Number(url.searchParams.get("floorId"));

    const weekStart = url.searchParams.get("weekStart") ?? "";

    const report = await ansattService.getFloorReport(floorId, weekStart);

    return Response.json({
      ok: true,
      data: report,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function reviewFloorReport(request: Request) {
  try {
    const user = await requireAnsatt(request);

    if (!user) {
      return Response.json(
        { ok: false, error: "Ingen tilgang" },
        { status: 403 },
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Ugyldig forespørsel");
    }

    const data = body as Record<string, unknown>;

    if (
      typeof data.floorId !== "number" ||
      typeof data.weekStart !== "string" ||
      typeof data.approved !== "boolean" ||
      !Array.isArray(data.checks) ||
      typeof data.comment !== "string"
    ) {
      throw new Error("Ugyldige rapportdata");
    }

    const report = await ansattService.reviewFloorReport(
      data.floorId,
      data.weekStart,
      user.id,
      data.approved,
      data.checks,
      data.comment,
    );

    return Response.json({
      ok: true,
      data: report,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
