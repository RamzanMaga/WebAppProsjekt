// Authoriserings api for å logge inn, registrere og logge ut brukere, samt hente informasjon om den nåværende brukeren.

//Inneholder infromasjom om bygninger og etasjer som brukeren kan velge mellom når de registrerer seg.
export type LocationData = {
    buildings: { id: number; name: string }[];
    floors: { id: number; buildingId: number; number: number }[]
 };

 //DTO opplysninger som Api-et returnerer om en bruker. Inneholder id, fornavn, etternavn, epost, bygningId og etasjeId. 
export type UserDTO = { 
    id: number;
    firstName: string; 
    lastName: string; 
    email: string; 
    buildingId: number | null; 
    floorId: number | null };

//Resultattypen som brukes for å returnere data fra API-et. Enten en suksess med data, eller en feil med kode og melding.    
export type Result<T> = { ok: true; data: T } | { ok: false; 
    error: { 
        code: string; 
        message: string; 
        fieldErrors?: Record<string, string[]> } 
    };

//Sender til auth API-et, path bestemmer hvilket endepunkt som kalles, og options bestemmer hvilken type request som sendes. Hvis den ikke får kontakt med serveren, returnerer den en feilmelding med kode 500 og en melding om at den ikke fikk kontakt med serveren.    
async function request<T>(
    path: string, 
    options?: RequestInit): 
    Promise<Result<T>> 
    {
  try {
    const response = await fetch(`/api/v1/auth/${path}`, { 
        credentials: "same-origin",
         ...options 
        });

    return await response.json() as Result<T>;
  } catch {
    return {
         ok: false, 
         error: {
            code: "500",
            message: "Fikk ikke kontakt med serveren" 
        } 
    };
 }
}

//Hjelpefunksjon som gjør det enkeler eå sende data til API-et.
//Daten sendes som JSON, og metoden settes til POST. Brukes av registerUser og loginUser funksjonene.
const jsonPost = (data: unknown): RequestInit => ({
    method: "POST", 
    headers: { 
        "Content-Type": "application/json"
    }, body: JSON.stringify(data) 
});

//Henter listen over bygninger og etasjer som brukeren kan velge mellom når de registrerer seg.
export const getLocations = () => 
    request<LocationData>("locations");

//Sender opplysninger fra registreringsskjemaet til API-et for å opprette en ny bruker. Returnerer en Result<UserDTO> som inneholder informasjon om den nye brukeren hvis registreringen var vellykket, eller en feilmelding hvis det oppstod en feil.
export const registerUser = (data: unknown) => 
    request<UserDTO>("register", jsonPost(data));

//Sender epost og passord til API-et for å logge inn brukeren. Returnerer en Result<UserDTO> som inneholder informasjon om brukeren hvis innloggingen var vellykket, eller en feilmelding hvis det oppstod en feil.
export const loginUser = (data: unknown) =>
     request<UserDTO>("login", jsonPost(data));

//Sjekker om brukeren er logget inn, og returnerer en Result<UserDTO> som inneholder informasjon om brukeren hvis den er logget inn, eller en feilmelding hvis den ikke er logget inn.
export const getCurrentUser = () =>
     request<UserDTO>("me");

//Sender en post request til API-et for å logge ut brukeren. Returnerer en Result<null> som inneholder en suksessmelding hvis utloggingen var vellykket, eller en feilmelding hvis det oppstod en feil.
export const logoutUser = () => 
    request<null>("logout", { method: "POST" });

//Sender gammelt passord, nytt passord og bekreftelse av nytt passord til API-et for å endre brukerens passord
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => request<null>("change-password", jsonPost(data));