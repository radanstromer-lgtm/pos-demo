import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

declare global {
  var __mysqlPool: mysql.Pool | undefined;
}

let sslConfig = {};
try {
  // Cara yang kompatibel dengan ESM dan CJS
  const certPath = path.join(process.cwd(), 'db', 'ca.pem');
  const caCert = fs.readFileSync(certPath, 'utf-8');
  sslConfig = { ssl: { ca: caCert, rejectUnauthorized: true } };
} catch (e) {
  console.warn('CA cert not found, connecting without SSL:', e);
}

const pool =
  global.__mysqlPool ??
  mysql.createPool({ 
    uri: process.env.DATABASE_URL, 
    ...sslConfig 
  });

if (process.env.NODE_ENV !== "production") global.__mysqlPool = pool;

export const db = drizzle(pool);
export { schema };