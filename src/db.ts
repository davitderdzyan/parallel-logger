import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.resolve("./data/logs.db"));
export { db };

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT,
    message TEXT,
    timestamp TEXT
  )
`).run();
