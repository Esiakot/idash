/**
 * Accès à la base MySQL via un pool de connexions partagé.
 * Rôle : évite d'ouvrir une nouvelle connexion à chaque requête (coûteux),
 * et fournit un helper de transaction sécurisé (commit/rollback automatique).
 */
import mysql, { PoolConnection } from "mysql2/promise";
import { DB_CONFIG } from "@/constants";

// Pool unique partagé sur toute l'app (singleton lazy).
let pool: mysql.Pool | null = null;

/**
 * Retourne le pool MySQL, l'initialise au premier appel.
 * Les paramètres de connexion proviennent des variables d'environnement
 * (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).
 */
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
