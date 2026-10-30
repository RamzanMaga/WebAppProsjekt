import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";
import { authRoutes } from "@/features/Auth//auth-routes";
import { taskRoutes } from "@/features/tasks/task-routes";
import { studentRoutes } from "@/features/student/student-routes";
import { StudentPage } from "@/features/student/pages/StudentPage";
import { AnsattSide } from "@/features/Ansatt/ansattside";

export type AppContext = {};
const app = defineApp([
  setCommonHeaders(),
  ...authRoutes,
  ...studentRoutes,
  ...taskRoutes,
  route("/api/status", () => Response.json({ status: "ok", version: "0.1.0" })),
  render(Document, [route("/", Home), route("/student", StudentPage), route("/ansatt", AnsattSide)]),
]);
export default { fetch: app.fetch };


