const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function main() {
  const serverConn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true
  });

  await serverConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await serverConn.end();

  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true
  });

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const dir = path.join(__dirname, 'migrations');
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const [rows] = await conn.query('SELECT id FROM migrations WHERE name = ?', [file]);
      if (rows.length) {
        console.log(`= ${file} ya aplicada`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await conn.query(sql);
      await conn.query('INSERT INTO migrations (name) VALUES (?)', [file]);
      console.log(`✓ ${file} aplicada`);
    }
  } finally {
    await conn.end();
  }
}

env.validateEnv();
main().catch((error) => {
  console.error('No se pudieron aplicar las migraciones:', error.message);
  process.exit(1);
});