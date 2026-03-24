// middleware.ts — Next.js Edge Middleware (racine du projet)
import { NextRequest, NextResponse } from "next/server";

/**
 * Filet de sécurité centralisé : vérifie la présence du cookie d'auth
 * avant que la requête n'atteigne les route handlers sous /api/si/*.
 * La vérification complète (signature HMAC, groupes) reste dans chaque handler.
 */
export function middleware(req: NextRequest) {
  const authToken = req.cookies.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: "Accès refusé: utilisateur non authentifié" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/si/:path*"],
};
