//Kontroller for autentisering og brukerhåndtering
//Dette skjer ved at kontrolleren mottar HTTP-forespørsler, 
//kaller tjenestefunksjoner for å utføre operasjoner som registrering, pålogging, 
//henting av brukerdata, endring av passord og utlogging, og returnerer deretter 
//passende HTTP-responser til klienten. 
//Forskjellen mellom denne kontrolleren og tjenesten er at kontrolleren håndterer HTTP-forespørsler og -responser,
//mens tjenesten inneholder forretningslogikken for autentisering og brukerhåndtering. 

import { service } from "./auth-service";

const COOKIE = "w08_session"; // Navnet på informasjonskapselen som brukes til å lagre sesjonstokenet
//Det vi gjør her er å hente ut verdien av informasjonskapselen som inneholder sesjonstokenet fra HTTP-forespørselen.
//Dette gjøres ved å lese "cookie"-headeren i forespørselen, splitte den opp i individuelle informasjonskapsler, 
//og deretter finne den som starter med navnet på informasjonskapselen (COOKIE). Hvis informasjonskapselen finnes, 
//returneres verdien av tokenet; ellers returneres null.
export const cookieToken = (request: Request) => 
  request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1) ?? null;
const cookie = (token: string, request: Request) =>
  `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;

//Funksjon for å lage en HTTP-respons med JSON-data, gir også mulighet for å spesifisere HTTP-statuskode og håndtere feil.
function respond(
  result: {
    ok: boolean;
    data?: unknown;
    error?: { code: string };
  },
  status = 200, // Standard HTTP-statuskode for vellykket respons
) {
  return Response.json(result, {
    status: result.ok ? status : Number(result.error?.code ?? 500), // Hvis resultatet er vellykket, bruk den angitte statuskoden, ellers bruk feilkoden fra resultatet eller standard til 500 (intern serverfeil)
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
async function readJson(request: Request) { // Funksjon for å lese JSON-data fra en HTTP-forespørsel
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
    return respond(await service.register(await readJson(request)), 201); // Returnerer HTTP-statuskode 201 (Created) ved vellykket registrering
  },

// Funksjon for å håndtere pålogging av brukere
  async login({ request }: { request: Request }) {
    const result = await service.login(await readJson(request));

    if (!result.ok) return respond(result);
    const response = respond({ ok: true, data: result.data.user });

    response.headers.set("Set-Cookie", cookie(result.data.token, request));

    return response;
  },
  async me({ request }: { request: Request }) { // Funksjon for å hente informasjon om den påloggede brukeren
    return respond(await service.me(cookieToken(request)));
  },

  async changePassword({ request }: { request: Request }) { // Funksjon for å håndtere endring av passord for brukere
    const token = cookieToken(request);
    const data = await readJson(request);

    return respond(await service.changePassword(token, data));
},

  async logout({ request }: { request: Request }) { // Funksjon for å håndtere utlogging av brukere
    const result = await service.logout(cookieToken(request));
    const response = respond(result);

    if (result.ok) // Hvis utloggingen er vellykket, fjern informasjonskapselen ved å sette den til en tom verdi og en utløpstid på 0
      response.headers.set(
        "Set-Cookie",
        `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${
          new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
      );
    return response;
  },
};
