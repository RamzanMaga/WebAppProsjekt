//Her er koden for å håndtere passordhashing og tokenhåndtering i autentiseringsprosessen. 
//Den bruker moderne kryptografiske metoder for å sikre at passord lagres og verifiseres på 
//en sikker måte. Dette gjør den ved å bruke PBKDF2-algoritmen for passordhashing og SHA-256 for tokenhashing.
//De funker slik at når en bruker registrerer seg eller endrer passordet sitt, blir passordet hashet med en unik saltverdi og lagret i databasen.
//Når brukeren logger inn, blir passordet de oppgir hashet på nytt med samme saltverdi, og den resulterende hashen sammenlignes med den lagrede hashen for å verifisere om passordet er korrekt.
//Vi bruker andre binære formater som hex for å representere de binære dataene som strenger, noe som gjør det enklere å lagre og overføre dem. 

const encoder = new TextEncoder(); // Oppretter en TextEncoder for å konvertere strenger til Uint8Array (binært format) som brukes i kryptografiske operasjoner.

const toHex = (bytes: Uint8Array) => // Funksjon for å konvertere en Uint8Array (binært format) til en hex-streng
  Array.from(
    bytes, b => b.toString(16).padStart(2, "0")
  ).join("");

const fromHex = (hex: string) => // Funksjon for å konvertere en hex-streng tilbake til en Uint8Array (binært format)
  new Uint8Array(
    hex.match(/.{2}/g)?.map(x => parseInt(x, 16)) ?? [] // Deler hex-strengen i grupper på 2 tegn, konverterer hver gruppe til et tall og lager en Uint8Array
  );

async function derive( // Funksjon for å derivere en hash fra et passord og en saltverdi ved hjelp av PBKDF2-algoritmen
  password: string, 
  salt: Uint8Array
): Promise<string> {
  const key = await crypto.subtle.importKey( // Importerer passordet som en kryptografisk nøkkel for PBKDF2-algoritmen
    "raw", 
    encoder.encode(password), 
    "PBKDF2", 
    false, 
    ["deriveBits"]
);

  const bits = await crypto.subtle.deriveBits( // Deriverer en hash fra passordet og saltverdien ved hjelp av PBKDF2-algoritmen med SHA-256 som hashfunksjon og 310000 iterasjoner
    { 
      name: "PBKDF2", //PBKDF2 (Password-Based Key Derivation Function 2) er en kryptografisk algoritme som brukes til å derivere en sikker nøkkel fra et passord. Den bruker en saltverdi og et antall iterasjoner for å gjøre det vanskeligere for angripere å brute-force passordet.
      hash: "SHA-256", //SHA-256 (Secure Hash Algorithm 256-bit) er en kryptografisk hashfunksjon som produserer en 256-bits (32-byte) hashverdi. Den brukes i PBKDF2-algoritmen for å sikre at passordet hashet på en sikker måte.
      salt: new Uint8Array(salt), 
      iterations: 310000 // Antall iterasjoner for PBKDF2-algoritmen, som gjør det vanskeligere for angripere å brute-force passordet. det er 310 000 fordi det er en god balanse mellom sikkerhet og ytelse, og det er anbefalt av NIST (National Institute of Standards and Technology) for passordhashing. 
    }, 
      key, 256 // Lengden på den resulterende hashen i biter (256 biter = 32 byte)
    );

  return toHex(new Uint8Array(bits)); // Konverterer den resulterende hashen til en hex-streng og returnerer den
}
export async function hashPassword(password: string) { 
  const salt = crypto.getRandomValues(new Uint8Array(16));

  return `pbkdf2-sha256:310000:${toHex(salt)}:${await //returnerer en streng som inneholder algoritmen som brukes (pbkdf2-sha256), antall iterasjoner (310000), saltverdien i hex-format og den resulterende hashen av passordet. Dette formatet gjør det enkelt å lagre og verifisere passordet senere.
derive(password, salt)}`;
}

export async function verifyPassword( // Funksjon for å verifisere om et gitt passord samsvarer med en lagret hash
  password: string, 
  stored: string | null
): Promise<boolean> {
  if (!stored) {
    return false; 
}
  const parts = stored.split(":");
  
  if ( //Sjekker om den lagrede hashen har riktig format og inneholder de nødvendige delene (algoritme, iterasjoner, salt og hash). Hvis ikke, returneres false.
    parts.length !== 4 || 
    parts[0] !== "pbkdf2-sha256" || 
    parts[1] !== "310000" ||
     !/^[0-9a-f]{32}$/.test(parts[2]) || //sjekker om saltverdien er en gyldig hex-streng med 32 tegn (16 byte) og om hashen er en gyldig hex-streng med 64 tegn (32 byte). Hvis ikke, returneres false.
     !/^[0-9a-f]{64}$/.test(parts[3])
    ){ 
      return false;
    }
  
    const expected = parts[3]; 
    const actual = await derive(password, fromHex(parts[2]));
  
    let difference = 0;
  
    for (let i = 0; i < expected.length; i++) {
      difference |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
    }

  return difference === 0;
}

export function newSessionToken() { // Funksjon for å generere et nytt sesjonstoken ved å bruke kryptografisk sikre tilfeldige verdier
  return toHex(crypto.getRandomValues(new Uint8Array(32))); //Genererer et 32-byte (256-bits) tilfeldig token og konverterer det til en hex-streng
}
// Funksjon for å hashe et token ved hjelp av SHA-256-algoritmen
export async function tokenHash(token: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256", 
    encoder.encode(token)
  );
  
  return toHex(new Uint8Array(bytes));
}
