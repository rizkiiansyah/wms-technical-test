CREATE TABLE role_accesses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_role_accesses_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_role_accesses_role_id ON role_accesses(role_id);
CREATE INDEX idx_role_accesses_key ON role_accesses(key);


INSERT INTO role_accesses (name, key, role_id, created_at, updated_at) VALUES
('Orders List',   'orders.list',   1, NOW(), NOW()),
('Orders Detail', 'orders.detail', 1, NOW(), NOW()),

('Orders List',   'orders.list',   2, NOW(), NOW()),
('Orders Detail', 'orders.detail', 2, NOW(), NOW()),

('Orders List',   'orders.list',   3, NOW(), NOW()),
('Orders Detail', 'orders.detail', 3, NOW(), NOW()),
('Orders Pick',   'orders.pick',   3, NOW(), NOW()),

('Orders List',   'orders.list',   4, NOW(), NOW()),
('Orders Detail', 'orders.detail', 4, NOW(), NOW()),
('Orders Pack',   'orders.pack',   4, NOW(), NOW()),

('Orders List',   'orders.list',   5, NOW(), NOW()),
('Orders Detail', 'orders.detail', 5, NOW(), NOW()),
('Orders Ship',   'orders.ship',   5, NOW(), NOW());