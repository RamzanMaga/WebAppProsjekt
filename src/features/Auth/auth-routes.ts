import { route } from "rwsdk/router";
import { controller } from "./auth-controller";
export const authRoutes = [
  route("/api/v1/auth/locations", { get: controller.locations }),
  route("/api/v1/auth/register", { post: controller.register }),
  route("/api/v1/auth/login", { post: controller.login }),
  route("/api/v1/auth/me", { get: controller.me }),
  route("/api/v1/auth/logout", { post: controller.logout }),
];
