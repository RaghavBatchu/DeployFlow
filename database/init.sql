-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);


-- =========================
-- ROLES TABLE
-- =========================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE
);


-- =========================
-- USER ROLES (Many-to-Many)
-- allows a single user to have multiple roles
-- =========================
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,

    PRIMARY KEY (user_id, role_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);


-- =========================
-- PIPELINE TABLE
-- stores assigned users for each role
-- =========================
CREATE TABLE pipeline (
    id SERIAL PRIMARY KEY,

    project_name VARCHAR(100) DEFAULT 'DeployFlow',

    developer_id INT,
    qa_id INT,
    devops_id INT,
    manager_id INT,

    build_status VARCHAR(20) DEFAULT 'pending',
    test_status VARCHAR(20) DEFAULT 'locked',
    deploy_status VARCHAR(20) DEFAULT 'locked',
    release_status VARCHAR(20) DEFAULT 'locked',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (developer_id) REFERENCES users(id),
    FOREIGN KEY (qa_id) REFERENCES users(id),
    FOREIGN KEY (devops_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);


-- =========================
-- PIPELINE LOGS
-- used for the right sidebar activity feed
-- =========================
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,

    pipeline_id INT,
    user_id INT,
    role VARCHAR(50),
    action TEXT,
    comment TEXT,

    timestamp TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- =========================
-- SEED ROLES
-- =========================
INSERT INTO roles (role_name) VALUES ('developer'), ('qa'), ('devops'), ('manager') ON CONFLICT (role_name) DO NOTHING;
