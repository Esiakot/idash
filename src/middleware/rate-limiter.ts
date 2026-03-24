// src/middleware/rate-limiter.ts
import { RATE_LIMIT } from "@/constants";

/**
 * Structure pour stocker les tentatives par IP
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple rate limiter en mémoire
 * En production, utiliser Redis pour un rate limiting distribué
 */
class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = RATE_LIMIT.MAX_ATTEMPTS, windowMs: number = RATE_LIMIT.WINDOW_MS) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;

    // Nettoyer les anciennes entrées périodiquement
    setInterval(() => this.cleanup(), RATE_LIMIT.CLEANUP_INTERVAL_MS);
  }

  /**
   * Vérifie si une IP peut faire une requête
   * @param ip - L'adresse IP
   * @returns true si la requête est autorisée, false sinon
   */
  check(ip: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(ip);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre ou première tentative
      this.attempts.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxAttempts) {
      // Limite atteinte
      return false;
    }

    // Incrémenter le compteur
    entry.count++;
    return true;
  }

  /**
   * Obtient le temps restant avant reset (en secondes)
   * @param ip - L'adresse IP
   * @returns Le nombre de secondes avant reset, ou 0 si pas de limite
   */
  getTimeUntilReset(ip: string): number {
    const entry = this.attempts.get(ip);
    if (!entry) return 0;

    const now = Date.now();
    const remaining = entry.resetTime - now;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  /**
   * Reset manuel du compteur pour une IP (après succès par exemple)
   * @param ip - L'adresse IP
   */
  reset(ip: string): void {
    this.attempts.delete(ip);
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(ip);
      }
    }
  }
}

// Instance globale du rate limiter pour l'authentification
// 5 tentatives max par 15 minutes
export const authRateLimiter = new RateLimiter();

/**
 * Extrait l'IP réelle du client depuis les headers
 * @param headers - Les headers de la requête
 * @returns L'adresse IP du client
 */
export function getClientIp(headers: Headers): string {
  // Vérifier les headers de proxy communs
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return headers.get("x-client-ip") || "unknown";
}
