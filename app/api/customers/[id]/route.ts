import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [c] = await db.select().from(schema.customers).where(eq(schema.customers.id, params.id));
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    medicalHistory: c.medicalHistory,
    points: c.points,
    createdAt: c.createdAt?.toISOString() ?? null,
  });
}
