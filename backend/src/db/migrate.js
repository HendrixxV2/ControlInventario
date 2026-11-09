const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

async function main() {
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true
  });

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
    try {
      await conn.query('START TRANSACTION');
      await conn.query(sql);
      await conn.query('INSERT INTO migrations (name) VALUES (?)', [file]);
      await conn.query('COMMIT');
      console.log(`✓ ${file} aplicada`);
    } catch (e) {
      await conn.query('ROLLBACK');
      console.error(`✗ Error en ${file}:`, e.message);
      throw e;
    }
  }

  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});