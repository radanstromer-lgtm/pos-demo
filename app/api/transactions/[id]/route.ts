import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [t] = await db
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
    })
    .from(schema.transactions)
    .leftJoin(schema.branches, eq(schema.transactions.branchId, schema.branches.id))
    .leftJoin(schema.customers, eq(schema.transactions.customerId, schema.customers.id))
    .leftJoin(schema.users, eq(schema.transactions.cashierId, schema.users.id))
    .where(eq(schema.transactions.id, params.id));

  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lineItems = await db
    .select({
      id: schema.transactionItems.id,
      itemId: schema.transactionItems.itemId,
      itemName: schema.items.name,
      quantity: schema.transactionItems.quantity,
      priceAtSale: schema.transactionItems.priceAtSale,
    })
    .from(schema.transactionItems)
    .leftJoin(schema.items, eq(schema.transactionItems.itemId, schema.items.id))
    .where(eq(schema.transactionItems.transactionId, params.id));

  return NextResponse.json({
    ...t,
    totalAmount: Number(t.totalAmount),
    createdAt: t.createdAt.toISOString(),
    itemCount: lineItems.length,
    items: lineItems.map((li) => ({
      ...li,
      priceAtSale: Number(li.priceAtSale),
    })),
  });
}
