import { route } from "rwsdk/router";
import { cookieToken } from "../Auth/auth-controller";
import { service as authService } from "../Auth/auth-service";
import { getFloorReport } from "./ansatt-service";

export const studentReviewRoutes = [
  route("/api/student/ansatt-review", async ({ request }) => {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const result = await authService.me(cookieToken(request));

      if (!result.ok) {
        return Response.json(
          { error: "Du må være logget inn" },
          { status: 401 },
        );
      }

      const user = result.data;

      if (user.role !== "student" || user.floorId == null) {
        return Response.json({ error: "Ingen tilgang" }, { status: 403 });
      }

      const url = new URL(request.url);
      const weekStart = url.searchParams.get("weekStart") ?? "";

      const report = await getFloorReport(user.floorId, weekStart);

      return Response.json({
        status: report.status,
        comment: report.comment,
        weekStart: report.weekStart,
      });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Kunne ikke hente vurderingen",
        },
        { status: 400 },
      );
    }
  }),
];
