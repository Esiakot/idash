// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authRateLimiter, getClientIp } from "@/middleware/rate-limiter";
import { auditLogger } from "@/services/audit-logger";
import { withErrorHandler, ApiError } from "@/libs/api-wrapper";
import { signCookie } from "@/libs/cookie-signer";
import { API_ROUTES, COOKIE_CONFIG, DB_GROUP_COLUMNS, ERROR_MESSAGES, HTTP_STATUS, USER_COLUMNS_NO_PASSWORD } from "@/constants";
import { getPool } from "@/libs/db";
import { AuthSchema } from "@/validations";
import { flagOn } from "@/utils/formatters";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    // Rate limiting par IP
    const clientIp = getClientIp(req.headers);
    if (!authRateLimiter.check(clientIp)) {
      const retryAfter = authRateLimiter.getTimeUntilReset(clientIp);
      auditLogger.logRateLimited(clientIp, API_ROUTES.AUTH);
      throw new ApiError(
        ERROR_MESSAGES.RATE_LIMITED(retryAfter),
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = AuthSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(ERROR_MESSAGES.CREDENTIALS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
    }
    const { username, password } = parsed.data;

    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${USER_COLUMNS_NO_PASSWORD}, mot_de_passe FROM utilisateurs WHERE samaccountname = ?`,
      [username]
    );

    const dbUser = rows[0];
    if (!dbUser || !dbUser.mot_de_passe) {
      // Message générique pour ne pas révéler l'existence d'un utilisateur
      auditLogger.logAuthFailed(username, clientIp, "User not found or no password");
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, dbUser.mot_de_passe);
    if (!isMatch) {
      auditLogger.logAuthFailed(username, clientIp, "Invalid password");
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Récupération des groupes à partir des colonnes de la DB
    const groups: string[] = [];
    for (const mapping of DB_GROUP_COLUMNS) {
      if (flagOn(dbUser[mapping.column])) {
        groups.push(mapping.group);
        if ("extras" in mapping && mapping.extras) {
          groups.push(...mapping.extras);
        }
      }
    }

    authRateLimiter.reset(clientIp);
    auditLogger.logAuthSuccess(username, clientIp, groups);

    const response = NextResponse.json({
      ok: true,
      username,
      groupes: groups,
    });

    response.cookies.set(COOKIE_CONFIG.AUTH_TOKEN, signCookie(username), {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      path: COOKIE_CONFIG.PATH,
      maxAge: COOKIE_CONFIG.MAX_AGE,
    });

    response.cookies.set(COOKIE_CONFIG.AUTH_GROUPS, signCookie(JSON.stringify(groups)), {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      path: COOKIE_CONFIG.PATH,
      maxAge: COOKIE_CONFIG.MAX_AGE,
    });

    return response;
  })(req);
}
