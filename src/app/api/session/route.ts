import { NextRequest, NextResponse } from "next/server";
import { COOKIE_CONFIG } from "@/constants";
import { parseSessionFromCookies } from "@/middleware/auth-middleware";

export const runtime = "nodejs";

// GET - Récupérer la session courante
export async function GET(req: NextRequest) {
  const { username, groups } = parseSessionFromCookies(req);

  return NextResponse.json({
    authenticated: Boolean(username),
    username,
    groups,
  });
}

// DELETE - Détruire la session (logout)
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
