CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'almacen',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  tax_id VARCHAR(60) NULL,
  contact VARCHAR(120) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(190) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_suppliers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(40) NOT NULL,
  code VARCHAR(60) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_locations_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materials (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  unit VARCHAR(40) NOT NULL,
  min_stock DECIMAL(14,3) NOT NULL DEFAULT 0,
  max_stock DECIMAL(14,3) NOT NULL DEFAULT 0,
  avg_daily_demand DECIMAL(14,3) NOT NULL DEFAULT 0,
  max_daily_demand DECIMAL(14,3) NOT NULL DEFAULT 0,
  lead_time_days INT UNSIGNED NOT NULL DEFAULT 0,
  reorder_point DECIMAL(14,3) GENERATED ALWAYS AS (min_stock) STORED,
  category VARCHAR(100) NULL,
  subcategory VARCHAR(100) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_materials_code (code),
  KEY idx_materials_name (name),
  KEY idx_materials_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(80) NOT NULL,
  supplier_id INT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'borrador',
  destination_location_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  observations TEXT NULL,
  total DECIMAL(16,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_purchase_orders_number (order_number),
  KEY idx_purchase_orders_created (created_at),
  CONSTRAINT fk_purchase_orders_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
  CONSTRAINT fk_purchase_orders_location FOREIGN KEY (destination_location_id) REFERENCES locations (id),
  CONSTRAINT fk_purchase_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  purchase_order_id INT UNSIGNED NOT NULL,
  material_id INT UNSIGNED NOT NULL,
  quantity DECIMAL(14,3) NOT NULL,
  unit_price DECIMAL(16,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(16,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_purchase_order_items_order (purchase_order_id),
  KEY idx_purchase_order_items_material (material_id),
  CONSTRAINT fk_purchase_order_items_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_order_items_material FOREIGN KEY (material_id) REFERENCES materials (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  material_id INT UNSIGNED NOT NULL,
  type VARCHAR(20) NOT NULL,
  quantity DECIMAL(14,3) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  origin_location_id INT UNSIGNED NULL,
  destination_location_id INT UNSIGNED NULL,
  source_document VARCHAR(120) NULL,
  observations TEXT NULL,
  movement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movements_material_date (material_id, movement_date),
  KEY idx_movements_date (movement_date),
  CONSTRAINT fk_movements_material FOREIGN KEY (material_id) REFERENCES materials (id),
  CONSTRAINT fk_movements_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_movements_origin FOREIGN KEY (origin_location_id) REFERENCES locations (id),
  CONSTRAINT fk_movements_destination FOREIGN KEY (destination_location_id) REFERENCES locations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  material_id INT UNSIGNED NOT NULL,
  type VARCHAR(40) NOT NULL,
  current_stock DECIMAL(14,3) NOT NULL,
  reorder_point DECIMAL(14,3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  resolved_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_alerts_status_created (status, created_at),
  KEY idx_alerts_material (material_id),
  CONSTRAINT fk_alerts_material FOREIGN KEY (material_id) REFERENCES materials (id),
  CONSTRAINT fk_alerts_resolved_by FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS duplicate_rules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quantity_diff_pct DECIMAL(7,3) NOT NULL DEFAULT 10,
  date_window_days INT UNSIGNED NOT NULL DEFAULT 7,
  excluded_statuses VARCHAR(255) NOT NULL DEFAULT 'cancelada',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW movement_effects AS
  SELECT id AS movement_id, material_id, destination_location_id AS location_id,
         quantity AS qty
  FROM movements
  WHERE type IN ('entrada', 'traslado', 'ajuste')
    AND destination_location_id IS NOT NULL
  UNION ALL
  SELECT id AS movement_id, material_id, origin_location_id AS location_id,
         -quantity AS qty
  FROM movements
  WHERE type IN ('salida', 'traslado')
    AND origin_location_id IS NOT NULL;
