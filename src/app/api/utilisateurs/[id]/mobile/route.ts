/**
 * Route /api/utilisateurs/[id]/mobile - Méthodes : GET, PATCH.
 * Rôle : lire et modifier le numéro mobile d'un utilisateur (champ séparé du téléphone fixe).
 * Auth : réservé au groupe Glo_ServiceInfo (donnée modifiable uniquement par le SI).
 */
import { NextRequest, NextResponse } from "next/server";
import { requireGroup } from "@/middleware/auth-middleware";
import { withErrorHandler } from "@/libs/api-wrapper";
import { validateRequest, parseRouteId } from "@/utils/request-helpers";
import { withTransaction } from "@/libs/db";
import { auditLogger } from "@/services/audit-logger";
import { ERROR_MESSAGES, GROUP_SERVICE_INFO, HTTP_STATUS } from "@/constants";
import { UpdateMobileSchema } from "@/validations";

export const runtime = "nodejs";

/**
 * GET /api/utilisateurs/:id/mobile - Retourne le numéro mobile actuel.
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const params = "then" in context.params ? await context.params : context.params;
    const userId = parseRouteId(params, "ID utilisateur");

    requireGroup(req, GROUP_SERVICE_INFO);

    const mobiles = await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        "SELECT mobile FROM utilisateurs WHERE id = ?",
        [userId]
      );
      return Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).mobile : null;
    });

    return NextResponse.json({ ok: true, mobiles });
  })(req);
}

/**
 * PATCH /api/utilisateurs/:id/mobile - Met à jour le numéro mobile.
 * Body : { mobile } (validé par UpdateMobileSchema, format souple).
 * Loggué dans l'audit (USER_MOBILE_UPDATE) car donnée personnelle modifiée.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const params = "then" in context.params ? await context.params : context.params;
    const userId = parseRouteId(params, "ID utilisateur");

    const auth = requireGroup(req, GROUP_SERVICE_INFO);

    const { mobile: newMobile } = await validateRequest(req, UpdateMobileSchema);

    const affectedRows = await withTransaction(async (conn) => {
      const [result] = await conn.execute(
        "UPDATE utilisateurs SET mobile = ? WHERE id = ?",
        [newMobile, userId]
      );
      return (result as any)?.affectedRows;
    });

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.USER_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    auditLogger.logMobileUpdate(auth.username, auth.ip, userId, newMobile);

    return NextResponse.json({ ok: true, mobiles: newMobile });
  })(req);
}
