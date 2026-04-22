import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateAppointmentInput } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get("branchId");
  const status = req.nextUrl.searchParams.get("status") as any;
  const conds: any[] = [];
  if (branchId) conds.push(eq(schema.appointments.branchId, branchId));
  if (status) conds.push(eq(schema.appointments.status, status));

  const q = db
    .select({
      id: schema.appointments.id,
      customerId: schema.appointments.customerId,
      branchId: schema.appointments.branchId,
      serviceId: schema.appointments.serviceId,
      staffId: schema.appointments.staffId,
      scheduledAt: schema.appointments.scheduledAt,
      status: schema.appointments.status,
      customerName: schema.customers.fullName,
      serviceName: schema.items.name,
      branchName: schema.branches.name,
      staffName: schema.users.name,
    })
    .from(schema.appointments)
    .innerJoin(schema.customers, eq(schema.appointments.customerId, schema.customers.id))
    .innerJoin(schema.items, eq(schema.appointments.serviceId, schema.items.id))
    .innerJoin(schema.branches, eq(schema.appointments.branchId, schema.branches.id))
    .leftJoin(schema.users, eq(schema.appointments.staffId, schema.users.id))
    .orderBy(desc(schema.appointments.scheduledAt));

  const rows = conds.length ? await q.where(and(...conds)) : await q;
  return NextResponse.json(
    rows.map((r) => ({ ...r, scheduledAt: r.scheduledAt.toISOString() })),
  );
}

export async function POST(req: NextRequest) {
  const body = CreateAppointmentInput.parse(await req.json());
  const appointmentId = crypto.randomUUID();
  await db
    .insert(schema.appointments)
    .values({
      id: appointmentId,
      customerId: body.customerId,
      branchId: body.branchId,
      serviceId: body.serviceId,
      staffId: body.staffId ?? null,
      scheduledAt: new Date(body.scheduledAt),
      status: "pending",
    });
  return NextResponse.json(
    {
      id: appointmentId,
      customerId: body.customerId,
      branchId: body.branchId,
      serviceId: body.serviceId,
      staffId: body.staffId ?? null,
      scheduledAt: new Date(body.scheduledAt).toISOString(),
      status: "pending",
      customerName: null,
      serviceName: null,
      branchName: null,
      staffName: null,
    },
    { status: 201 },
  );
}
