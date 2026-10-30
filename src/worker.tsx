import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";
import { authRoutes } from "@/features/Auth//auth-routes";
import { taskRoutes } from "@/features/tasks/task-routes";
import { studentRoutes } from "@/features/student/student-routes";
import { StudentPage } from "@/features/student/pages/StudentPage";
import { AnsattSide } from "@/features/Ansatt/components/ansattside";
import { service } from "@/features/Auth/auth-service";
import { cookieToken } from "@/features/Auth/auth-controller";
import { ansattRoutes } from "@/features/Ansatt/ansatt-routes";
import { studentReviewRoutes } from "@/features/Ansatt/student-review-routes";
export type AppContext = {};
const app = defineApp([
  setCommonHeaders(),
  ...authRoutes,
  ...studentRoutes,
  ...taskRoutes,
  ...ansattRoutes,
  ...studentReviewRoutes,
  route("/api/status", () => Response.json({ status: "ok", version: "0.1.0" })),

  render(Document, [
    route("/", Home),

    route("/student", async ({ request }) => {
      const result = await service.me(cookieToken(request));

      if (!result.ok) {
        return Response.redirect(new URL("/", request.url));
      }

      if (result.data.role === "ansatt") {
        return Response.redirect(new URL("/ansatt", request.url));
      }

      return <StudentPage />;
    }),

    route("/ansatt", async ({ request }) => {
      const result = await service.me(cookieToken(request));

      if (!result.ok) {
        return Response.redirect(new URL("/", request.url));
      }

      if (result.data.role !== "ansatt") {
        return Response.redirect(new URL("/student", request.url));
      }

      return <AnsattSide />;
    }),
  ]),
]);
export default { fetch: app.fetch };
