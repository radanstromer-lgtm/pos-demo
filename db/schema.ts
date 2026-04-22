import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  decimal,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const userRoles = ["admin", "cashier", "doctor", "therapist"] as const;
export const itemCategories = ["product", "service"] as const;
export const appointmentStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;

export const branches = mysqlTable("branches", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  branchId: varchar("branch_id", { length: 36 }).references(() => branches.id),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: mysqlEnum("role", userRoles).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 100 }),
  medicalHistory: text("medical_history"),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = mysqlTable("items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  category: mysqlEnum("category", itemCategories).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 50 }).unique(),
  isAvailable: boolean("is_available").default(true).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  durationMinutes: int("duration_minutes"),
});

export const inventories = mysqlTable("inventories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  branchId: varchar("branch_id", { length: 36 }).references(() => branches.id).notNull(),
  itemId: varchar("item_id", { length: 36 }).references(() => items.id).notNull(),
  stockQuantity: int("stock_quantity").default(0).notNull(),
  lowStockThreshold: int("low_stock_threshold").default(5).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id).notNull(),
  branchId: varchar("branch_id", { length: 36 }).references(() => branches.id).notNull(),
  serviceId: varchar("service_id", { length: 36 }).references(() => items.id).notNull(),
  staffId: varchar("staff_id", { length: 36 }).references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: mysqlEnum("status", appointmentStatuses).default("pending").notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  branchId: varchar("branch_id", { length: 36 }).references(() => branches.id).notNull(),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  cashierId: varchar("cashier_id", { length: 36 }).references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionItems = mysqlTable("transaction_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  transactionId: varchar("transaction_id", { length: 36 }).references(() => transactions.id).notNull(),
  itemId: varchar("item_id", { length: 36 }).references(() => items.id).notNull(),
  quantity: int("quantity").notNull(),
  priceAtSale: decimal("price_at_sale", { precision: 12, scale: 2 }).notNull(),
});
