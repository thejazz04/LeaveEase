// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Change if using a different DB user
  password: '112233',        // Add your MySQL password if any
  database: 'leaveease'  // Changed to match actual database name
});

// Handle connection errors
db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err.message);
    // Try to reconnect
    setTimeout(() => {
      console.log('Attempting to reconnect to database...');
      db.connect();
    }, 2000);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Handle connection errors after initial connection
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    db.connect();
  } else {
    throw err;
  }
});

module.exports = db;
