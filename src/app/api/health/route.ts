// src/app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/libs/db";
import { REQUIRED_ENV_VARS, HTTP_STATUS } from "@/constants";

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
    checks.database = { status: "ok" };
  } catch {
    checks.database = { status: "error" };
  }

  // 2. Vérifier les variables d'environnement critiques
  const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  checks.environment = { status: missingVars.length > 0 ? "warning" : "ok" };

  // Déterminer le statut global
  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const hasErrors = Object.values(checks).some((c) => c.status === "error");

  const status = hasErrors ? "unhealthy" : allOk ? "healthy" : "degraded";
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
