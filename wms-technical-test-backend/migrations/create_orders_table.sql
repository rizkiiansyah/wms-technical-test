CREATE TABLE orders (
    order_sn VARCHAR(255) PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL,
    marketplace_status VARCHAR(100) NOT NULL,
    shipping_status VARCHAR(100) NOT NULL,
    wms_status VARCHAR(100),
    tracking_number VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    raw_marketplace_payload TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_orders_order_sn ON orders(order_sn);
CREATE INDEX idx_orders_wms_status ON orders(wms_status);