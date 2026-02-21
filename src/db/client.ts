import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import { articles } from './schema.js';

const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') ?? 'dev.db');

export const db = drizzle(sqlite, { schema: { articles } });

db.run(sql`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    published_at TEXT NOT NULL,
    posted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(sql`
  DELETE FROM articles 
  WHERE created_at < datetime('now', '-7 days')
`);
