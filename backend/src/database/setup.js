
const Database = require('better-sqlite3');

const db = new Database('scheduler.db', { verbose: console.log });

function setup() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cron_schedule TEXT NOT NULL,
      prompt TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS job_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      output TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      FOREIGN KEY (job_id) REFERENCES jobs (id)
    )
  `);
}

setup();
