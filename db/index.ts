import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import fs from 'fs';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

const caCertPath = path.resolve(__dirname, './ca-cert.pem');
const caCert = fs.readFileSync(caCertPath, 'utf-8');


const pool =
  global.__mysqlPool ??
  mysql.createPool({ uri: process.env.DATABASE_URL, ssl: {
    ca: caCert, 
    rejectUnauthorized: true, 
  },
 });

if (process.env.NODE_ENV !== "production") global.__mysqlPool = pool;

export const db = drizzle(pool);
export { schema };
