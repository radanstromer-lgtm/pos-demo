import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 5);

  const conds: any[] = [];
  if (branchId) conds.push(eq(schema.transactions.branchId, branchId));

  const base = db
    .select({
      itemId: schema.transactionItems.itemId,
      name: schema.items.name,
      category: schema.items.category,
      totalQuantity: sql<number>`SUM(${schema.transactionItems.quantity})`,
      totalRevenue: sql<string>`SUM(${schema.transactionItems.quantity} * ${schema.transactionItems.priceAtSale})`,
    })
    .from(schema.transactionItems)
    .innerJoin(schema.items, eq(schema.transactionItems.itemId, schema.items.id))
    .innerJoin(
      schema.transactions,
      eq(schema.transactionItems.transactionId, schema.transactions.id),
    )
    .groupBy(schema.transactionItems.itemId, schema.items.name, schema.items.category)
    .orderBy(desc(sql`SUM(${schema.transactionItems.quantity})`))
    .limit(limit);

  const rows = conds.length ? await base.where(and(...conds)) : await base;
  return NextResponse.json(
    rows.map((r) => ({ ...r, totalRevenue: Number(r.totalRevenue) })),
  );
}
