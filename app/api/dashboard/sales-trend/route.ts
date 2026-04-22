import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  const days = Number(req.nextUrl.searchParams.get("days") ?? 7);
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const conds: any[] = [gte(schema.transactions.createdAt, since)];
  if (branchId) conds.push(eq(schema.transactions.branchId, branchId));

  const rows = await db
    .select({
      date: sql<string>`DATE_FORMAT(DATE(${schema.transactions.createdAt}), '%Y-%m-%d')`,
      revenue: sql<string>`COALESCE(SUM(${schema.transactions.totalAmount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.transactions)
    .where(and(...conds))
    .groupBy(sql`DATE(${schema.transactions.createdAt})`)
    .orderBy(sql`DATE(${schema.transactions.createdAt})`);

  const map = new Map(rows.map((r) => [r.date, r]));
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const r = map.get(key);
    result.push({
      date: key,
      revenue: r ? Number(r.revenue) : 0,
      transactionCount: r ? r.count : 0,
    });
  }
  return NextResponse.json(result);
}
