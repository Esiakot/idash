/**
 * Route /api/telephones - Méthodes : GET, POST, PUT, DELETE.
 * Rôle : CRUD des téléphones fixes (poste + lignes internes), liés à un utilisateur.
 * Auth : GET ouvert aux groupes autorisés ; POST/PUT/DELETE réservés au SI.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { requireAnyGroup, requireGroup } from "@/middleware/auth-middleware";
import { withErrorHandler } from "@/libs/api-wrapper";
import { validateRequest } from "@/utils/request-helpers";
import { withTransaction } from "@/libs/db";
import { auditLogger } from "@/services/audit-logger";
import { ERROR_MESSAGES, GROUPS_AUTORISES, GROUP_SERVICE_INFO, HTTP_STATUS } from "@/constants";
import { CreateTelephoneSchema, UpdateTelephoneSchema, DeleteTelephoneSchema } from "@/validations";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

/**
 * GET /api/telephones - Liste des téléphones rattachés à un utilisateur.
 */
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    requireAnyGroup(req, GROUPS_AUTORISES);

    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, poste, lignes_internes, utilisateur_id
       FROM telephones
       WHERE utilisateur_id IS NOT NULL
       ORDER BY poste`
    );

    return NextResponse.json(rows);
  })(req);
}

/**
 * POST /api/telephones - Crée un téléphone et le rattache à un utilisateur.
 * Body : { poste, lignes_internes, utilisateur_id }.
 */
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const auth = requireGroup(req, GROUP_SERVICE_INFO);

    const { poste, lignes_internes, utilisateur_id } = await validateRequest(req, CreateTelephoneSchema);

    const insertId = await withTransaction(async (conn) => {
      const [res] = await conn.execute(
        "INSERT INTO telephones (poste, lignes_internes, utilisateur_id) VALUES (?, ?, ?)",
        [poste, lignes_internes, utilisateur_id]
      );
      return (res as any)?.insertId;
    });

    auditLogger.logTelephoneCreate(auth.username, auth.ip, insertId, { poste, utilisateur_id });

    return NextResponse.json(
      { ok: true, telephone: { id: insertId, poste, lignes_internes, utilisateur_id } },
      { status: HTTP_STATUS.CREATED }
    );
  })(req);
}

/**
 * PUT /api/telephones - Met à jour poste + lignes internes d'un téléphone existant.
 * Body : { id, poste, lignes_internes }.
 */
export async function PUT(req: NextRequest) {
  return withErrorHandler(async () => {
    const auth = requireGroup(req, GROUP_SERVICE_INFO);

    const { id: telId, poste, lignes_internes } = await validateRequest(req, UpdateTelephoneSchema);

    const affectedRows = await withTransaction(async (conn) => {
      const [res] = await conn.execute(
        "UPDATE telephones SET poste = ?, lignes_internes = ? WHERE id = ?",
        [poste, lignes_internes, telId]
      );
      return (res as any)?.affectedRows;
    });

    if (affectedRows === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.PHONE_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    auditLogger.logTelephoneUpdate(auth.username, auth.ip, telId, { poste });

    return NextResponse.json({ ok: true });
  })(req);
}

/**
 * DELETE /api/telephones - Supprime un téléphone par id.
 */
export async function DELETE(req: NextRequest) {
  return withErrorHandler(async () => {
    const auth = requireGroup(req, GROUP_SERVICE_INFO);

    const { id: telId } = await validateRequest(req, DeleteTelephoneSchema);

    const affectedRows = await withTransaction(async (conn) => {
      const [res] = await conn.execute("DELETE FROM telephones WHERE id = ?", [telId]);
      return (res as any)?.affectedRows;
    });

    if (affectedRows === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.PHONE_NOT_FOUND }, { status: HTTP_STATUS.NOT_FOUND });
    }

    auditLogger.logTelephoneDelete(auth.username, auth.ip, telId);

    return NextResponse.json({ ok: true });
  })(req);
}
