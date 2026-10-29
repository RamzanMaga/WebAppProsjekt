import { route } from "rwsdk/router";
import { studentController } from "./student-controller";

export const studentRoutes = [
  route("/api/v1/student/my-group", { get: studentController.myGroup }),
];
