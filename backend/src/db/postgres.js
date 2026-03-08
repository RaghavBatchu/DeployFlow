const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
} else {
    // Fallback to standard process.env mapping
    require("dotenv").config();
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.connect()
    .then(() => console.log("PostgreSQL connected"))
    .catch(err => console.error("DB connection error", err));

module.exports = pool;
