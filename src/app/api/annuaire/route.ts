/**
 * Route /api/annuaire - Méthode : GET.
 * Rôle : retourne la liste complète des utilisateurs (sans hash de mot de passe),
 * avec leurs flags de groupes AD, pour alimenter le tableau de l'annuaire.
 * Auth : requise (toute personne authentifiée peut lire l'annuaire).
 */
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { requireAuth } from "@/middleware/auth-middleware";
import { withErrorHandler } from "@/libs/api-wrapper";
import { flagOn } from "@/utils/formatters";
import { USER_COLUMNS_NO_PASSWORD } from "@/constants";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

/**
 * GET /api/annuaire
 * Réponse : tableau d'utilisateurs trié par nom/prénom, avec :
 * - les colonnes utiles (sans mot_de_passe) via USER_COLUMNS_NO_PASSWORD
 * - le champ "mobiles" remapé depuis "mobile" (nommage front)
 * - le booléen isStagiaire dérivé du flag DB Glo_Stagiaire
 */
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
