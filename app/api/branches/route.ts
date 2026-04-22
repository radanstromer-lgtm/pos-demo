import { NextResponse } from "next/server";
import { db, schema } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(schema.branches).orderBy(schema.branches.name);
  return NextResponse.json(
    rows.map((b) => ({ id: b.id, name: b.name, address: b.address, phone: b.phone })),
  );
}
