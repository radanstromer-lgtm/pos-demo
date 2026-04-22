import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { CreateTransactionInput } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50);
  const conds: any[] = [];
  if (branchId) conds.push(eq(schema.transactions.branchId, branchId));

  const ic = db
    .select({
      transactionId: schema.transactionItems.transactionId,
      count: sql<number>`COUNT(*)`.as("item_count"),
    })
    .from(schema.transactionItems)
    .groupBy(schema.transactionItems.transactionId)
    .as("ic");

  const q = db
    .select({
      id: schema.transactions.id,
      branchId: schema.transactions.branchId,
      branchName: schema.branches.name,
      customerId: schema.transactions.customerId,
      customerName: schema.customers.fullName,
      cashierId: schema.transactions.cashierId,
      cashierName: schema.users.name,
      totalAmount: schema.transactions.totalAmount,
      paymentMethod: schema.transactions.paymentMethod,
      createdAt: schema.transactions.createdAt,
      itemCount: ic.count,
    })
    .from(schema.transactions)
    .leftJoin(schema.branches, eq(schema.transactions.branchId, schema.branches.id))
    .leftJoin(schema.customers, eq(schema.transactions.customerId, schema.customers.id))
    .leftJoin(schema.users, eq(schema.transactions.cashierId, schema.users.id))
    .leftJoin(ic, eq(ic.transactionId, schema.transactions.id))
    .orderBy(desc(schema.transactions.createdAt))
    .limit(limit);

  const rows = conds.length ? await q.where(and(...conds)) : await q;
  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      totalAmount: Number(r.totalAmount),
      createdAt: r.createdAt.toISOString(),
      itemCount: r.itemCount ?? 0,
    })),
  );
}

export async function POST(req: NextRequest) {
  const body = CreateTransactionInput.parse(await req.json());

  const insertData = {
    id: body.id || crypto.randomUUID(),
    branchId: body.branchId,
    customerId: body.customerId ?? null,
    cashierId: body.cashierId ?? null,
    totalAmount: body.totalAmount.toString(),
    paymentMethod: body.paymentMethod ?? null,
    createdAt: new Date(),
  };

  await db
    .insert(schema.transactions)
    .values(insertData);

  if (body.items.length > 0) {
    await db.insert(schema.transactionItems).values(
      body.items.map((it) => ({
        id: crypto.randomUUID(),
        transactionId: insertData.id,
        itemId: it.itemId,
        quantity: it.quantity,
        priceAtSale: it.priceAtSale.toString(),
      })),
    );

    for (const it of body.items) {
      const [itemRow] = await db
        .select()
        .from(schema.items)
        .where(eq(schema.items.id, it.itemId));
      if (itemRow && itemRow.category === "product") {
        await db
          .update(schema.inventories)
          .set({
            stockQuantity: sql`${schema.inventories.stockQuantity} - ${it.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(schema.inventories.branchId, body.branchId),
              eq(schema.inventories.itemId, it.itemId),
            ),
          );
      }
    }
  }

  if (body.customerId) {
    const points = Math.floor(body.totalAmount / 10000);
    if (points > 0) {
      await db
        .update(schema.customers)
        .set({ points: sql`${schema.customers.points} + ${points}` })
        .where(eq(schema.customers.id, body.customerId));
    }
  }

  return NextResponse.json(
    {
      ...insertData,
      totalAmount: Number(insertData.totalAmount),
      createdAt: insertData.createdAt.toISOString(),
      branchName: null,
      customerName: null,
      cashierName: null,
      itemCount: body.items.length,
    },
    { status: 201 },
  );
}
