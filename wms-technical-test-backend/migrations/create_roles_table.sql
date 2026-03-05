CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);


INSERT INTO roles (name, created_at, updated_at) VALUES
('Warehouse Operator', NOW(), NOW()),
('Warehouse Staff', NOW(), NOW()),
('Picker', NOW(), NOW()),
('Packer', NOW(), NOW()),
('Warehouse Admin', NOW(), NOW());