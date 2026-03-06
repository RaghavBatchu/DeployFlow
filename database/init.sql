CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50), -- 'developer' | 'qa' | 'devops' | 'manager'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pipeline (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(100) DEFAULT 'DeployFlow',
    build_status VARCHAR(20) DEFAULT 'locked',
    test_status VARCHAR(20) DEFAULT 'locked',
    deploy_status VARCHAR(20) DEFAULT 'locked',
    release_status VARCHAR(20) DEFAULT 'locked',
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    role VARCHAR(50),
    action TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Insert initial pipeline state so it's ready when the app starts
INSERT INTO pipeline (project_name) VALUES ('DeployFlow') ON CONFLICT DO NOTHING;
