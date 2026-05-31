/** OBS WebSocket v5 authentication (browser Web Crypto). */

async function sha256Base64(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(hash))));
}

export async function computeObsAuth(
  password: string,
  salt: string,
  challenge: string
): Promise<string> {
  const secret = await sha256Base64(password + salt);
  return sha256Base64(secret + challenge);
}
