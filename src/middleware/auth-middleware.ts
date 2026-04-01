// src/middleware/auth-middleware.ts
import { NextRequest } from "next/server";
import { ApiError } from "@/libs/api-wrapper";
import { unsignCookie } from "@/libs/cookie-signer";
import { COOKIE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/constants";
import type { AuthContext } from "@/types";
import { getClientIp } from "./rate-limiter";

/**
 * Parse les cookies d'une requête
 */
function parseCookies(req: NextRequest | Request): Record<string, string> {
  const cookieHeader = req.headers.get("cookie") || "";
  return Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const [key, ...rest] = c.split("=");
        const val = rest.join("=");
        return [key, decodeURIComponent(val)];
      })
  );
}

/**
 * Extrait et vérifie les cookies d'authentification signés.
 * Utilisé par requireAuth et le endpoint session.
 */
export function parseSessionFromCookies(req: NextRequest | Request): {
  username: string | null;
  groups: string[];
} {
  const cookies = parseCookies(req);
  const rawToken = cookies[COOKIE_CONFIG.AUTH_TOKEN];
  const rawGroups = cookies[COOKIE_CONFIG.AUTH_GROUPS];

  const username = rawToken ? unsignCookie(rawToken) : null;

  let groups: string[] = [];
  if (rawGroups) {
    const groupsJson = unsignCookie(rawGroups);
    if (groupsJson) {
      try {
        const parsed = JSON.parse(groupsJson);
        groups = Array.isArray(parsed)
          ? parsed.filter((g: unknown): g is string => typeof g === "string")
          : [];
      } catch {
        groups = [];
      }
    }
  }

  return { username, groups };
}

/**
 * Vérifie l'authentification d'un utilisateur via les cookies signés
 * @param req - La requête Next.js
 * @returns Les informations d'authentification (username, groupes, IP)
 * @throws ApiError si l'utilisateur n'est pas authentifié ou si la signature est invalide
 */
export function requireAuth(req: NextRequest | Request): AuthContext {
  const { username, groups } = parseSessionFromCookies(req);

  if (!username) {
    throw new ApiError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const ip = getClientIp(req.headers);
  return { username, groups, ip };
}

/**
 * Vérifie l'authentification ET l'appartenance à un groupe
 * @param req - La requête Next.js
 * @param requiredGroup - Le groupe requis pour accéder à la ressource
 * @returns Les informations d'authentification
 * @throws ApiError si l'utilisateur n'est pas authentifié ou n'a pas le groupe requis
 */
export function requireGroup(
  req: NextRequest | Request,
  requiredGroup: string
): AuthContext {
  const auth = requireAuth(req);

  if (!auth.groups.includes(requiredGroup)) {
    throw new ApiError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  return auth;
}

/**
 * Vérifie l'authentification ET l'appartenance à au moins un des groupes spécifiés
 * @param req - La requête Next.js
 * @param allowedGroups - Liste des groupes autorisés (accepte readonly)
 * @returns Les informations d'authentification
 * @throws ApiError si l'utilisateur n'est pas authentifié ou n'a aucun des groupes requis
 */
export function requireAnyGroup(
  req: NextRequest | Request,
  allowedGroups: readonly string[]
): AuthContext {
  const auth = requireAuth(req);

  const hasGroup = auth.groups.some((g) => allowedGroups.includes(g));
  if (!hasGroup) {
    throw new ApiError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  return auth;
}
