import "dotenv/config";
import mysql from "mysql2/promise";

const queries = [
  `INSERT INTO branches (id, name, address, phone) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Lumière Senopati', 'Jl. Senopati No. 88, Jakarta Selatan', '+62 21 7220 1188'),
    ('22222222-2222-2222-2222-222222222222', 'Lumière Kemang', 'Jl. Kemang Raya No. 42, Jakarta Selatan', '+62 21 7180 4242'),
    ('33333333-3333-3333-3333-333333333333', 'Lumière PIK', 'Ruko Garden House Blok B12, PIK, Jakarta Utara', '+62 21 5022 9090')
  ON DUPLICATE KEY UPDATE id=VALUES(id)`,

  `INSERT INTO users (id, branch_id, name, email, password_hash, role, is_active) VALUES
    ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Sari Wulandari', 'sari@lumiere.id', 'placeholder', 'cashier', 1),
    ('aaaaaaa1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'dr. Anindita Putri', 'anindita@lumiere.id', 'placeholder', 'doctor', 1),
    ('aaaaaaa1-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Rina Mahardhika', 'rina@lumiere.id', 'placeholder', 'therapist', 1),
    ('aaaaaaa1-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'Bella Khairunnisa', 'bella@lumiere.id', 'placeholder', 'cashier', 1),
    ('aaaaaaa1-0000-0000-0000-000000000005', NULL, 'Admin Pusat', 'admin@lumiere.id', 'placeholder', 'admin', 1)
  ON DUPLICATE KEY UPDATE id=VALUES(id)`,

  `INSERT INTO customers (id, full_name, phone, email, medical_history, points) VALUES
    ('cccccc01-0000-0000-0000-000000000001', 'Andini Sukmawati', '+62 812 3456 7890', 'andini@gmail.com', 'Kulit sensitif', 240),
    ('cccccc01-0000-0000-0000-000000000002', 'Maya Lestari', '+62 813 9876 5432', 'maya@yahoo.com', NULL, 580),
    ('cccccc01-0000-0000-0000-000000000003', 'Putri Anggraini', '+62 821 1122 3344', 'putri@gmail.com', 'Acne-prone skin', 120),
    ('cccccc01-0000-0000-0000-000000000004', 'Tania Marlina', '+62 815 4455 6677', 'tania@gmail.com', NULL, 60),
    ('cccccc01-0000-0000-0000-000000000005', 'Sherly Hidayat', '+62 818 7788 9900', 'sherly@gmail.com', 'Pernah filler 2024', 920)
  ON DUPLICATE KEY UPDATE id=VALUES(id)`,

  `INSERT INTO items (id, name, category, price, sku, is_available, description, duration_minutes) VALUES
    ('11110001-0000-0000-0000-000000000001', 'Hydra Glow Facial', 'service', 450000, 'SVC-HGF', 1, 'Facial pelembap mendalam', 60),
    ('11110001-0000-0000-0000-000000000002', 'Acne Calming Treatment', 'service', 525000, 'SVC-ACT', 1, 'Perawatan jerawat', 75),
    ('11110001-0000-0000-0000-000000000003', 'Laser Hair Removal Underarm', 'service', 850000, 'SVC-LHR', 1, 'Penghilang bulu permanen', 30),
    ('11110001-0000-0000-0000-000000000004', 'Botox Forehead', 'service', 3500000, 'SVC-BTX', 1, 'Botox area dahi', 45),
    ('11110001-0000-0000-0000-000000000005', 'Microneedling RF', 'service', 1850000, 'SVC-MRF', 1, 'Microneedling RF', 90),
    ('11110001-0000-0000-0000-000000000006', 'Chemical Peel', 'service', 750000, 'SVC-PEEL', 1, 'Eksfoliasi kimia', 45)
  ON DUPLICATE KEY UPDATE id=VALUES(id)`,

  `INSERT INTO items (id, name, category, price, sku, is_available, description) VALUES
    ('22220001-0000-0000-0000-000000000001', 'Lumière Vitamin C Serum 30ml', 'product', 385000, 'PRD-VCS-30', 1, 'Serum vitamin C 15%'),
    ('22220001-0000-0000-0000-000000000002', 'Lumière Hyaluronic Moisturizer 50ml', 'product', 295000, 'PRD-HM-50', 1, 'Pelembap HA'),
    ('22220001-0000-0000-0000-000000000003', 'Lumière SPF 50+ Sunscreen 60ml', 'product', 245000, 'PRD-SPF-60', 1, 'Sunscreen ringan'),
    ('22220001-0000-0000-0000-000000000004', 'Lumière Retinol 0.3% Night 30ml', 'product', 425000, 'PRD-RET-30', 1, 'Retinol malam'),
    ('22220001-0000-0000-0000-000000000005', 'Lumière Gentle Cleanser 150ml', 'product', 175000, 'PRD-GC-150', 1, 'Pembersih wajah lembut'),
    ('22220001-0000-0000-0000-000000000006', 'Lumière Niacinamide Toner 200ml', 'product', 215000, 'PRD-NCT-200', 1, 'Toner niacinamide 5%')
  ON DUPLICATE KEY UPDATE id=VALUES(id)`,

  `INSERT INTO inventories (id, branch_id, item_id, stock_quantity, low_stock_threshold)
  SELECT UUID(), b.id, i.id, CAST((RAND() * 30 + 3) AS UNSIGNED), 5
  FROM branches b, items i
  WHERE i.category = 'product'
  ON DUPLICATE KEY UPDATE id=VALUES(id)`,

  `UPDATE inventories SET stock_quantity = 2
  WHERE branch_id = '11111111-1111-1111-1111-111111111111'
    AND item_id IN ('22220001-0000-0000-0000-000000000001','22220001-0000-0000-0000-000000000005')`,

  `INSERT INTO appointments (id, customer_id, branch_id, service_id, staff_id, scheduled_at, status) VALUES
    (UUID(), 'cccccc01-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '11110001-0000-0000-0000-000000000001', 'aaaaaaa1-0000-0000-0000-000000000002', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'confirmed'),
    (UUID(), 'cccccc01-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '11110001-0000-0000-0000-000000000005', 'aaaaaaa1-0000-0000-0000-000000000002', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'pending'),
    (UUID(), 'cccccc01-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '11110001-0000-0000-0000-000000000002', 'aaaaaaa1-0000-0000-0000-000000000003', DATE_ADD(NOW(), INTERVAL 1 DAY), 'confirmed'),
    (UUID(), 'cccccc01-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', '11110001-0000-0000-0000-000000000004', NULL, DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending')`,
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });
  try {
    for (const query of queries) {
      await connection.query(query);
    }
    console.log("✓ Database seeded successfully");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
