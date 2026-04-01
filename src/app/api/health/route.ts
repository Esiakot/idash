// src/app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { REQUIRED_ENV_VARS, HTTP_STATUS, HEALTH_STATUS } from "@/constants";

export const runtime = "nodejs";

/**
 * Endpoint de health check
 * Retourne un statut minimal en public.
 * Les détails sensibles ne sont pas exposés.
 */
export async function GET(req: NextRequest) {
  const checks: Record<string, { status: string }> = {};

  // 1. Vérifier la connexion à la base de données
  try {
    const pool = getPool();
    await pool.execute("SELECT 1 as health");
    checks.database = { status: HEALTH_STATUS.OK };
  } catch {
    checks.database = { status: HEALTH_STATUS.ERROR };
  }

  // 2. Vérifier les variables d'environnement critiques
  const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  checks.environment = { status: missingVars.length > 0 ? HEALTH_STATUS.WARNING : HEALTH_STATUS.OK };

  // Déterminer le statut global
  const allOk = Object.values(checks).every((c) => c.status === HEALTH_STATUS.OK);
  const hasErrors = Object.values(checks).some((c) => c.status === HEALTH_STATUS.ERROR);

  const status = hasErrors ? HEALTH_STATUS.UNHEALTHY : allOk ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.DEGRADED;
  const httpStatus = hasErrors ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: httpStatus }
  );
}
