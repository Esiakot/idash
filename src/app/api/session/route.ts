import { NextRequest, NextResponse } from "next/server";
import { COOKIE_CONFIG } from "@/constants";
import { unsignCookie } from "@/libs/cookie-signer";

export const runtime = "nodejs";

// GET - Récupérer la session courante
export async function GET(req: NextRequest) {
  const rawToken = req.cookies.get(COOKIE_CONFIG.AUTH_TOKEN)?.value ?? null;
  const rawGroups = req.cookies.get(COOKIE_CONFIG.AUTH_GROUPS)?.value ?? null;

  // Vérifier les signatures des cookies
  const username = rawToken ? unsignCookie(rawToken) : null;
  const groupsJson = rawGroups ? unsignCookie(rawGroups) : null;

  let groups: string[] = [];
  try {
    groups = groupsJson
      ? JSON.parse(groupsJson).filter(
          (g: unknown): g is string => typeof g === "string"
        )
      : [];
  } catch {
    groups = [];
  }

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
