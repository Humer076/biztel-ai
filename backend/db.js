const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'workflow.db'));

db.serialize(() => {
  // Uploads table
  db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    filename TEXT,
    filepath TEXT,
    mimetype TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Records table - with summary column
  db.run(`CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    upload_id TEXT,
    date TEXT,
    shift TEXT,
    employee_number TEXT,
    operation_code TEXT,
    machine_number TEXT,
    work_order_number TEXT,
    quantity_produced INTEGER,
    time_taken TEXT,
    confidence_scores TEXT,
    validation_errors TEXT,
    summary TEXT,
    status TEXT DEFAULT 'pending_review',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_id) REFERENCES uploads(id)
  )`);

  // Add summary column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE records ADD COLUMN summary TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      // Column already exists or other error - ignore
      console.log('Summary column check complete');
    }
  });
});

module.exports = db;
