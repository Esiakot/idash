import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { requireAuth } from "@/middleware/auth-middleware";
import { withErrorHandler } from "@/libs/api-wrapper";
import { validateQueryParams } from "@/utils/request-helpers";
import { OrdinateursAnnuaireQuerySchema } from "@/validations";
import { ASSIGNMENT_STATUS, COMPUTER_TYPES, HTTP_STATUS, NULL_TOKEN, ORDINATEUR_SORT_MAP } from "@/constants";
import type { TypeRow, OSRow, CountRow, ComputerRow } from "@/types";

export const runtime = "nodejs";

// GET - Liste des ordinateurs avec facettes et filtres
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    requireAuth(req);

    const url = new URL(req.url);
    const queryParams = validateQueryParams(url, OrdinateursAnnuaireQuerySchema);

    const type = queryParams.type ?? "";
    const status = queryParams.status ?? ASSIGNMENT_STATUS.TOUS;
    const os = queryParams.os ?? "";
    const sortBy = queryParams.sortBy;
    const sortDir = queryParams.sortDir.toUpperCase() as "ASC" | "DESC";

    const pool = getPool();

    // Base + where
    const baseSelect = `
      SELECT 
        o.id, o.nom, o.systeme_exploitation, o.utilisateur_id, o.type,
        u.prenom, u.nom AS nom_utilisateur, u.activite
      FROM ordinateurs o
      LEFT JOIN utilisateurs u ON o.utilisateur_id = u.id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (type) {
      whereClauses.push("o.type = ?");
      params.push(type);
    }

    if (status === ASSIGNMENT_STATUS.AFFECTE) whereClauses.push("o.utilisateur_id IS NOT NULL");
    else if (status === ASSIGNMENT_STATUS.NON_AFFECTE)
      whereClauses.push("o.utilisateur_id IS NULL");

    if (os) {
      if (os === NULL_TOKEN) {
        whereClauses.push("o.systeme_exploitation IS NULL");
      } else {
        whereClauses.push("o.systeme_exploitation = ?");
        params.push(os);
      }
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";
    const orderCol = ORDINATEUR_SORT_MAP[sortBy] ?? "o.nom";
    const orderSql = `ORDER BY ${orderCol} ${sortDir}`;

    const sql = `${baseSelect} ${whereSql} ${orderSql}`;

    // Ex\u00e9cuter en parall\u00e8le : donn\u00e9es principales + facettes + stats consolid\u00e9es
    const [
      [rows],
      [typesRows],
      [osRows],
      [statsRows],
    ] = await Promise.all([
      pool.query<ComputerRow[]>(sql, params),
      pool.query<TypeRow[]>("SELECT DISTINCT type FROM ordinateurs ORDER BY type"),
      pool.query<OSRow[]>("SELECT DISTINCT systeme_exploitation FROM ordinateurs ORDER BY systeme_exploitation"),
      pool.query<CountRow[]>(
        `SELECT
           COUNT(*) AS total,
           SUM(utilisateur_id IS NOT NULL) AS assigned,
           SUM(type = ?) AS station,
           SUM(type = ?) AS serveur,
           SUM(type NOT IN (?, ?)) AS other
         FROM ordinateurs`,
        [COMPUTER_TYPES.STATION, COMPUTER_TYPES.SERVEUR, COMPUTER_TYPES.STATION, COMPUTER_TYPES.SERVEUR]
      ),
    ]);

    const stats = statsRows[0] ?? {};

    const response = {
      computers: rows,
      facets: {
        types: typesRows.map((r) => r.type),
        osList: osRows.map((r) => r.systeme_exploitation),
        stats: {
          total: stats.total ?? 0,
          assigned: stats.assigned ?? 0,
          nonAssigned: (stats.total ?? 0) - (stats.assigned ?? 0),
          station: stats.station ?? 0,
          serveur: stats.serveur ?? 0,
          other: stats.other ?? 0,
        },
      },
    };

    return NextResponse.json(response, { status: HTTP_STATUS.OK });
  })(req);
}