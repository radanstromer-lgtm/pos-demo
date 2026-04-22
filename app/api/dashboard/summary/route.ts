import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  const todayStart = startOfToday();

  const txConds: any[] = [gte(schema.transactions.createdAt, todayStart)];
  if (branchId) txConds.push(eq(schema.transactions.branchId, branchId));
  const [revenueRow] = await db
    .select({
      revenue: sql<string>`COALESCE(SUM(${schema.transactions.totalAmount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.transactions)
    .where(and(...txConds));

  const apptConds: any[] = [gte(schema.appointments.scheduledAt, todayStart)];
  if (branchId) apptConds.push(eq(schema.appointments.branchId, branchId));
  const [apptRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.appointments)
    .where(and(...apptConds));

  const [custRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.customers);

  let lowStockCount = 0;
  if (branchId) {
    const [lowRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.inventories)
      .where(
        and(
          eq(schema.inventories.branchId, branchId),
          lte(schema.inventories.stockQuantity, sql`${schema.inventories.lowStockThreshold}`),
        ),
      );
    lowStockCount = lowRow?.count ?? 0;
  }

  return NextResponse.json({
    todayRevenue: Number(revenueRow?.revenue ?? 0),
    todayTransactions: revenueRow?.count ?? 0,
    todayAppointments: apptRow?.count ?? 0,
    activeCustomers: custRow?.count ?? 0,
    lowStockCount,
  });
}
