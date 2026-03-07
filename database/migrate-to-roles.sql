-- =========================
-- One-time migration: add roles + user_roles, migrate users, recreate pipeline/logs
-- Run this if you get "relation user_roles does not exist" (existing DB from old schema).
-- =========================

-- 1. ROLES table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE
);
INSERT INTO roles (role_name) VALUES ('developer'), ('qa'), ('devops'), ('manager')
ON CONFLICT (role_name) DO NOTHING;

-- 2. USER_ROLES table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 3. If users still has old "role" column, migrate into user_roles then drop column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    -- Support TEXT[] (array) or VARCHAR role column
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') = 'ARRAY' THEN
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id FROM users u
      CROSS JOIN LATERAL unnest(COALESCE(u.role, ARRAY[]::text[])) AS role_val
      JOIN roles r ON r.role_name = role_val
      ON CONFLICT (user_id, role_id) DO NOTHING;
    ELSE
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id FROM users u
      JOIN roles r ON r.role_name = u.role::text
      WHERE u.role IS NOT NULL
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    ALTER TABLE users DROP COLUMN role;
  END IF;
END $$;

-- 4. Recreate pipeline and logs with new schema (drops existing data in these tables)
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS pipeline;

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

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    pipeline_id INT,
    user_id INT,
    role VARCHAR(50),
    action TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
