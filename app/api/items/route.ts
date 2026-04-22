import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as
    | "service"
    | "product"
    | null;
  const rows = category
    ? await db
        .select()
        .from(schema.items)
        .where(eq(schema.items.category, category))
        .orderBy(schema.items.name)
    : await db.select().from(schema.items).orderBy(schema.items.name);

  return NextResponse.json(
    rows.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      price: Number(i.price),
      sku: i.sku,
      isAvailable: i.isAvailable,
      imageUrl: i.imageUrl,
      description: i.description,
      durationMinutes: i.durationMinutes,
    })),
  );
}
