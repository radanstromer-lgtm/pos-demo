import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, lte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json([]);
  const rows = await db
    .select()
    .from(schema.inventories)
    .innerJoin(schema.items, eq(schema.inventories.itemId, schema.items.id))
    .where(
      and(
        eq(schema.inventories.branchId, branchId),
        lte(schema.inventories.stockQuantity, sql`${schema.inventories.lowStockThreshold}`),
      ),
    )
    .orderBy(schema.inventories.stockQuantity);
  return NextResponse.json(
    rows.map((row: any) => ({
      id: row.inventories.id,
      branchId: row.inventories.branchId,
      itemId: row.inventories.itemId,
      stockQuantity: row.inventories.stockQuantity,
      lowStockThreshold: row.inventories.lowStockThreshold,
      item: {
        id: row.items.id,
        name: row.items.name,
        category: row.items.category,
        price: Number(row.items.price),
        sku: row.items.sku,
        isAvailable: row.items.isAvailable,
        imageUrl: row.items.imageUrl,
        description: row.items.description,
        durationMinutes: row.items.durationMinutes,
      },
    })),
  );
}
