
const Database = require('better-sqlite3');
const db = new Database('scheduler.db');
module.exports = db;
