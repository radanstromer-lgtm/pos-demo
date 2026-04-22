import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { ilike, or, desc } from "drizzle-orm";
import { CreateCustomerInput } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const rows = search
    ? await db
        .select()
        .from(schema.customers)
        .where(
          or(
            ilike(schema.customers.fullName, `%${search}%`),
            ilike(schema.customers.phone, `%${search}%`),
          ),
        )
        .orderBy(desc(schema.customers.createdAt))
    : await db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      medicalHistory: c.medicalHistory,
      points: c.points,
      createdAt: c.createdAt?.toISOString() ?? null,
    })),
  );
}

export async function POST(req: NextRequest) {
  const body = CreateCustomerInput.parse(await req.json());
  const customerId = crypto.randomUUID();
  const now = new Date();
  await db
    .insert(schema.customers)
    .values({
      id: customerId,
      fullName: body.fullName,
      phone: body.phone ?? null,
      email: body.email || null,
      medicalHistory: body.medicalHistory ?? null,
      points: 0,
      createdAt: now,
    });
  return NextResponse.json(
    {
      id: customerId,
      fullName: body.fullName,
      phone: body.phone ?? null,
      email: body.email || null,
      medicalHistory: body.medicalHistory ?? null,
      points: 0,
      createdAt: now.toISOString(),
    },
    { status: 201 },
  );
}
