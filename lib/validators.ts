import { trace } from "console";
import { z } from "zod";

export const ItemCategoryEnum = z.enum(["service", "product"]);
export const PaymentMethodEnum = z.enum(["Tunai", "QRIS", "Kartu", "Cash", "Card"]);
export const AppointmentStatusEnum = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const CreateCustomerInput = z.object({
  fullName: z.string().min(1),
  phone: z.string().nullish(),
  email: z.string().email().nullish().or(z.literal("")),
  medicalHistory: z.string().nullish(),
});

export const CreateAppointmentInput = z.object({
  customerId: z.string().uuid(),
  branchId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullish(),
  scheduledAt: z.string(),
});

export const UpdateAppointmentStatusInput = z.object({
  status: AppointmentStatusEnum,
});

export const CreateTransactionInput = z.object({
  id: z.string().uuid(),
  branchId: z.string().uuid(),
  customerId: z.string().uuid().nullish(),
  cashierId: z.string().uuid().nullish(),
  totalAmount: z.number().nonnegative(),
  paymentMethod: z.string().nullish(),
  items: z
    .array(
      z.object({
        transactionId: z.string().uuid(),
        itemId: z.string().uuid(),
        quantity: z.number().int().positive(),
        priceAtSale: z.string(), // using string to avoid floating point issues, will be converted to decimal in DB
      }),
    )
    .default([]),
});
