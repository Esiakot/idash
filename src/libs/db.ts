import mysql from "mysql2/promise";
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
