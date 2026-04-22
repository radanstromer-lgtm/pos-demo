import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function mapRow(row: any) {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json([], { status: 200 });
  const rows = await db
    .select()
    .from(schema.inventories)
    .innerJoin(schema.items, eq(schema.inventories.itemId, schema.items.id))
    .where(eq(schema.inventories.branchId, branchId))
    .orderBy(schema.items.name);
  return NextResponse.json(rows.map(mapRow));
}
