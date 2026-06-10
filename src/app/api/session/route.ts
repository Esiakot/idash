/**
 * Route /api/session - Méthodes : GET, DELETE.
 * Rôle : exposer la session courante au front (GET) et la détruire (DELETE = logout).
 * Auth : publique — GET retourne authenticated:false si pas de cookie valide.
 */
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_CONFIG } from "@/constants";
import { parseSessionFromCookies } from "@/middleware/auth-middleware";

export const runtime = "nodejs";

/**
 * GET /api/session
 * Lit les cookies signés et retourne { authenticated, username, groups }.
 * Utilisé par les hooks côté client pour connaître l'utilisateur connecté.
 */
export async function GET(req: NextRequest) {
  const { username, groups } = parseSessionFromCookies(req);

  return NextResponse.json({
    authenticated: Boolean(username),
    username,
    groups,
  });
}

/**
 * DELETE /api/session
 * Logout : efface les cookies en posant maxAge=0.
 * (Pas de vérification d'auth : un utilisateur non connecté peut aussi déclencher l'effacement.)
 */
export async function DELETE() {
  const res = NextResponse.json({ success: true });

  res.cookies.set(COOKIE_CONFIG.AUTH_TOKEN, "", {
    maxAge: 0,
    path: COOKIE_CONFIG.PATH,
  });

  res.cookies.set(COOKIE_CONFIG.AUTH_GROUPS, "", {
    maxAge: 0,
    path: COOKIE_CONFIG.PATH,
  });

  return res;
}
