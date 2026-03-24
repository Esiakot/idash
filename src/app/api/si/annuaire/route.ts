import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { requireAuth } from "@/middleware/auth-middleware";
import { withErrorHandler } from "@/libs/api-wrapper";
import { flagOn } from "@/utils/formatters";
import { USER_COLUMNS_NO_PASSWORD } from "@/constants";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

// GET - Liste des utilisateurs de l'annuaire
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    requireAuth(req);

    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${USER_COLUMNS_NO_PASSWORD} FROM utilisateurs ORDER BY nom, prenom`
    );

    const normalized = rows.map((r) => ({
      ...r,
      // Mapper "mobile" (colonne DB) vers "mobiles" (attendu par le front)
      mobiles: r.mobile ?? "",
      isStagiaire: flagOn(r["Glo_Stagiaire"]),
    }));

    return NextResponse.json(normalized);
  })(req);
}
