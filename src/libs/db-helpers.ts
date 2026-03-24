// src/lib/db-helpers.ts
import { Pool, PoolConnection } from "mysql2/promise";
import { getPool } from "./db";

/**
 * Exécute une série d'opérations dans une transaction
 * Gère automatiquement commit/rollback/release
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
