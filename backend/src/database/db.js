
const Database = require('better-sqlite3');
const path = require('path');

// Use absolute path to ensure database is created in the project root
const dbPath = path.join(__dirname, '../../../scheduler.db');
const db = new Database(dbPath);

module.exports = db;
