CREATE TABLE order_items (
    order_sn VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_sn)
        REFERENCES orders(order_sn)
        ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_sn ON order_items(order_sn);
CREATE INDEX idx_order_items_sku ON order_items(sku);
CREATE UNIQUE INDEX idx_order_items_ordersn_sku ON order_items(order_sn, sku);