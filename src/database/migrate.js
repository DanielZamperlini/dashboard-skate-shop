import { readFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

const DB_PATH = join(process.cwd(), 'data.db');
const SCHEMA_PATH = join(process.cwd(), 'src', 'database', 'schema.sql');

function migrate() {
  const db = new Database(DB_PATH);
  const schema = readFileSync(SCHEMA_PATH, 'utf8');

  db.exec(schema);
  console.log('Migração concluída com sucesso!');
  
  db.close();
}

migrate();