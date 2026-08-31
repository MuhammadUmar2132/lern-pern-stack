import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const migrationsDir = __dirname;

  // Get all .sql files sorted by name
  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  console.log(`📦 Found ${files.length} migration(s)\n`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await pool.query(sql);
      console.log(`✅ ${file} — applied`);
    } catch (err) {
      console.error(`❌ ${file} — failed:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 All migrations applied successfully!');
  await pool.end();
  process.exit(0);
};

runMigrations();
