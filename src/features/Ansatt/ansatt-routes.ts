import { route } from "rwsdk/router";
import * as controller from "./ansatt-controller";

export const ansattRoutes = [
  route("/api/ansatt/reports", async ({ request }) => {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405,
      });
    }

    return controller.getFloorReport(request);
  }),

  route("/api/ansatt/reports/review", async ({ request }) => {
    if (request.method !== "PATCH") {
      return new Response("Method Not Allowed", {
        status: 405,
      });
    }

    return controller.reviewFloorReport(request);
  }),
];
