import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { UpdateAppointmentStatusInput } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = UpdateAppointmentStatusInput.parse(await req.json());
  await db
    .update(schema.appointments)
    .set({ status: body.status })
    .where(eq(schema.appointments.id, params.id));
  
  const [updated] = await db
    .select()
    .from(schema.appointments)
    .where(eq(schema.appointments.id, params.id));
  
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...updated,
    scheduledAt: updated.scheduledAt.toISOString(),
    customerName: null,
    serviceName: null,
    branchName: null,
    staffName: null,
  });
}
