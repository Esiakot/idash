// middleware.ts — Next.js Edge Middleware (racine du projet)
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/constants";

/**
 * Filet de sécurité centralisé : vérifie la présence du cookie d'auth
 * avant que la requête n'atteigne les route handlers protégés.
 * La vérification complète (signature HMAC, groupes) reste dans chaque handler.
 */
export function middleware(req: NextRequest) {
  const authToken = req.cookies.get(COOKIE_CONFIG.AUTH_TOKEN)?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/annuaire/:path*",
    "/api/ordinateurs/:path*",
    "/api/telephones/:path*",
    "/api/utilisateurs/:path*",
  ],
};
