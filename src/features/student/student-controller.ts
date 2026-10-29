import { cookieToken } from "@/features/auth/auth-controller";
import { getMyFloorGroup } from "./student-service";

export const studentController = {
  async myGroup({ request }: { request: Request }) {
    const result = await getMyFloorGroup(cookieToken(request));
    return Response.json(result, {
      status: result.ok ? 200 : Number(result.error.code),
      headers: { "Cache-Control": "no-store" },
    });
  },
};
