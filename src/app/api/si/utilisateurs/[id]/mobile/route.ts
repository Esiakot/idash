import { NextRequest, NextResponse } from "next/server";
import { requireGroup } from "@/middleware/auth-middleware";
import { withErrorHandler, ApiError } from "@/libs/api-wrapper";
import { validateRequest } from "@/utils/request-helpers";
import { withTransaction } from "@/libs/db-helpers";
import { auditLogger } from "@/services/audit-logger";
import { GROUP_SERVICE_INFO, HTTP_STATUS } from "@/constants";
import { UpdateMobileSchema } from "@/validations";

export const runtime = "nodejs";

/**
 * Valide et extrait le paramètre id depuis l'URL
 */
function parseUserId(params: { id: string }): number {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError("ID utilisateur invalide", HTTP_STATUS.BAD_REQUEST);
  }
  return id;
}

// GET - Récupérer le numéro mobile d'un utilisateur
export async function GET(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const params = "then" in context.params ? await context.params : context.params;
    const userId = parseUserId(params);

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

// PATCH - Mettre à jour le numéro mobile d'un utilisateur
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const params = "then" in context.params ? await context.params : context.params;
    const userId = parseUserId(params);

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
        { error: "Utilisateur non trouvé" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    auditLogger.logMobileUpdate(auth.username, auth.ip, userId, newMobile);

    return NextResponse.json({ ok: true, mobiles: newMobile });
  })(req);
}
