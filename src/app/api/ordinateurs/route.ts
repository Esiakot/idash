import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { requireAuth, requireGroup } from "@/middleware/auth-middleware";
import { withErrorHandler, ApiError } from "@/libs/api-wrapper";
import { validateRequest } from "@/utils/request-helpers";
import { withTransaction } from "@/libs/db";
import { auditLogger } from "@/services/audit-logger";
import { COMPUTER_TYPES, ERROR_MESSAGES, GROUP_SERVICE_INFO, HTTP_STATUS, QUERY_PARAMS } from "@/constants";
import { AssignComputerSchema, UnassignComputerSchema } from "@/validations";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

// GET - Liste des ordinateurs (avec option ?free=true pour les libres)
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const free = req.nextUrl.searchParams.get(QUERY_PARAMS.FREE) === QUERY_PARAMS.TRUE;
    
    if (free) {
      // Ordinateurs libres - réservé au service info
      requireGroup(req, GROUP_SERVICE_INFO);
      const pool = getPool();
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT id, nom, systeme_exploitation, version, utilisateur_id, type
         FROM ordinateurs
         WHERE type IN (?, ?) AND utilisateur_id IS NULL
         ORDER BY nom`,
        [COMPUTER_TYPES.STATION, COMPUTER_TYPES.PORTABLE]
      );
      return NextResponse.json(rows);
    }

    // Tous les ordinateurs assignés
    requireAuth(req);
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, nom, systeme_exploitation, version, utilisateur_id, type
       FROM ordinateurs
       WHERE utilisateur_id IS NOT NULL
       ORDER BY nom`
    );
    return NextResponse.json(rows);
  })(req);
}

// POST - Assigner un ordinateur à un utilisateur
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const auth = requireGroup(req, GROUP_SERVICE_INFO);

    const { ordinateur_id: ordId, utilisateur_id: userId } = await validateRequest(req, AssignComputerSchema);

    const ordinateur = await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        "SELECT id, type, utilisateur_id, nom, systeme_exploitation, version FROM ordinateurs WHERE id = ? FOR UPDATE",
        [ordId]
      );
      const r = (rows as any[])[0];
      if (!r) {
        throw new ApiError(ERROR_MESSAGES.COMPUTER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      if (r.type !== COMPUTER_TYPES.STATION && r.type !== COMPUTER_TYPES.PORTABLE) {
        throw new ApiError(ERROR_MESSAGES.ONLY_STATIONS_ASSIGNABLE, HTTP_STATUS.BAD_REQUEST);
      }
      if (r.utilisateur_id !== null) {
        throw new ApiError(ERROR_MESSAGES.COMPUTER_ALREADY_ASSIGNED, HTTP_STATUS.CONFLICT);
      }

      await conn.execute("UPDATE ordinateurs SET utilisateur_id = ? WHERE id = ?", [userId, ordId]);
      return { ...r, utilisateur_id: userId };
    });

    auditLogger.logComputerAssign(auth.username, auth.ip, ordId, userId);
    return NextResponse.json({ ok: true, ordinateur }, { status: HTTP_STATUS.CREATED });
  })(req);
}

// DELETE - Désassigner un ordinateur
export async function DELETE(req: NextRequest) {
  return withErrorHandler(async () => {
    const auth = requireGroup(req, GROUP_SERVICE_INFO);

    const { ordinateur_id: ordId } = await validateRequest(req, UnassignComputerSchema);

    const result = await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        "SELECT id, utilisateur_id FROM ordinateurs WHERE id = ? FOR UPDATE",
        [ordId]
      );
      const r = (rows as any[])[0];
      if (!r) {
        throw new ApiError(ERROR_MESSAGES.COMPUTER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      if (r.utilisateur_id === null) {
        throw new ApiError(ERROR_MESSAGES.COMPUTER_ALREADY_FREE, HTTP_STATUS.CONFLICT);
      }

      await conn.execute("UPDATE ordinateurs SET utilisateur_id = NULL WHERE id = ?", [ordId]);
      return { ok: true };
    });

    auditLogger.logComputerUnassign(auth.username, auth.ip, ordId);
    return NextResponse.json(result);
  })(req);
}
