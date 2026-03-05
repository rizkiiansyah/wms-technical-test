CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);


INSERT INTO users (email, password, role_id, created_at, updated_at) VALUES
('warehouseoperator@test.com', '$2a$10$4UEDPY6HD2r4HZLoIaPJRuYV0f/T0AR7MuxLmfx.3PHYNqPHLwbee', 1, NOW(), NOW()),
('warehousestaff@test.com', '$2a$10$4UEDPY6HD2r4HZLoIaPJRuYV0f/T0AR7MuxLmfx.3PHYNqPHLwbee', 2, NOW(), NOW()),
('picker@test.com', '$2a$10$4UEDPY6HD2r4HZLoIaPJRuYV0f/T0AR7MuxLmfx.3PHYNqPHLwbee', 3, NOW(), NOW()),
('packer@test.com', '$2a$10$4UEDPY6HD2r4HZLoIaPJRuYV0f/T0AR7MuxLmfx.3PHYNqPHLwbee', 4, NOW(), NOW()),
('warehouesadmin@test.com', '$2a$10$4UEDPY6HD2r4HZLoIaPJRuYV0f/T0AR7MuxLmfx.3PHYNqPHLwbee', 5, NOW(), NOW());