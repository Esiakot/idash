// src/libs/cookie-signer.ts
import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "COOKIE_SECRET manquant ou trop court (min 32 caractères). " +
        "Définir la variable d'environnement COOKIE_SECRET."
    );
  }
  return secret;
}

/**
 * Signe une valeur avec HMAC-SHA256
 * Retourne "valeur.signature"
 */
export function signCookie(value: string): string {
  const secret = getSecret();
  const signature = createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
  return `${value}.${signature}`;
}

/**
 * Vérifie et extrait la valeur d'un cookie signé
 * Retourne la valeur si la signature est valide, null sinon
 */
export function unsignCookie(signed: string): string | null {
  const secret = getSecret();
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;

  const value = signed.slice(0, idx);
  const providedSig = signed.slice(idx + 1);

  const expectedSig = createHmac("sha256", secret)
    .update(value)
    .digest("base64url");

  // Comparaison en temps constant pour éviter les timing attacks
  try {
    const a = Buffer.from(providedSig, "base64url");
    const b = Buffer.from(expectedSig, "base64url");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return value;
}
