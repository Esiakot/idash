import mysql, { PoolConnection } from "mysql2/promise";
import { DB_CONFIG } from "@/constants";

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || DB_CONFIG.DEFAULT_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: DB_CONFIG.CONNECTION_LIMIT,
      queueLimit: DB_CONFIG.QUEUE_LIMIT,
    });
  }
  return pool;
}

/**
 * Exécute une série d'opérations dans une transaction
 * Gère automatiquement commit/rollback/release
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();

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
