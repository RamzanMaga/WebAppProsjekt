const encoder = new TextEncoder();

const toHex = (bytes: Uint8Array) => 
  Array.from(
    bytes, b => b.toString(16).padStart(2, "0")
  ).join("");

const fromHex = (hex: string) =>
  new Uint8Array(
    hex.match(/.{2}/g)?.map(x => parseInt(x, 16)) ?? []
  );

async function derive(
  password: string, 
  salt: Uint8Array
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", 
    encoder.encode(password), 
    "PBKDF2", 
    false, 
    ["deriveBits"]
);

  const bits = await crypto.subtle.deriveBits(
    { 
      name: "PBKDF2", 
      hash: "SHA-256", 
      salt: new Uint8Array(salt), 
      iterations: 310000 
    }, 
      key, 256
    );

  return toHex(new Uint8Array(bits));
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  return `pbkdf2-sha256:310000:${toHex(salt)}:${await
derive(password, salt)}`;
}

export async function verifyPassword(
  password: string, 
  stored: string | null
): Promise<boolean> {
  if (!stored) {
    return false; 
}
  const parts = stored.split(":");
  
  if (
    parts.length !== 4 || 
    parts[0] !== "pbkdf2-sha256" || 
    parts[1] !== "310000" ||
     !/^[0-9a-f]{32}$/.test(parts[2]) || 
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

export function newSessionToken() { 
  return toHex(crypto.getRandomValues(new Uint8Array(32))); 
}

export async function tokenHash(token: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256", 
    encoder.encode(token)
  );
  
  return toHex(new Uint8Array(bytes));
}
