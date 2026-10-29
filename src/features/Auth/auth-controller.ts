import { service } from "./auth-service";

const COOKIE = "w08_session";

export const cookieToken = (request: Request) =>
  request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1) ?? null;
const cookie = (token: string, request: Request) =>
  `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;

function respond(
  result: {
    ok: boolean;
    data?: unknown;
    error?: { code: string };
  },
  status = 200,
) {
  return Response.json(result, {
    status: result.ok ? status : Number(result.error?.code ?? 500),
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
export const controller = {
  async locations() {
    return respond(await service.locations());
  },


  async register({ request }: { request: Request }) {
    return respond(await service.register(await readJson(request)), 201);
  },


  async login({ request }: { request: Request }) {
    const result = await service.login(await readJson(request));

    if (!result.ok) return respond(result);
    const response = respond({ ok: true, data: result.data.user });

    response.headers.set("Set-Cookie", cookie(result.data.token, request));

    return response;
  },
  async me({ request }: { request: Request }) {
    return respond(await service.me(cookieToken(request)));
  },

  async changePassword({ request }: { request: Request }) {
    const token = cookieToken(request);
    const data = await readJson(request);

    return respond(await service.changePassword(token, data));
},

  async logout({ request }: { request: Request }) {
    const result = await service.logout(cookieToken(request));
    const response = respond(result);

    if (result.ok)
      response.headers.set(
        "Set-Cookie",
        `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${
          new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
      );
    return response;
  },
};
