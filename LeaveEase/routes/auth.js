const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');

// LOGIN
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE usn = ?', [username], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) {
          res.send('Login successful');
        } else {
          res.send('Invalid username or password');
        }
      });
    } else {
      res.send('Invalid username or password');
    }
  });
});

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, usn, dob, password } = req.body;

  if (password.length < 8) {
    return res.send('Password must be at least 8 characters.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (name, usn, dob, password) VALUES (?, ?, ?, ?)', 
    [name, usn, dob, hashedPassword], 
    (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.send('USN already exists.');
        }
        throw err;
      }
      res.send('Signup successful');
    });
});

// FORGOT PASSWORD
router.post('/forgot-password', (req, res) => {
  const { usn, dob, newPassword } = req.body;

  db.query('SELECT * FROM users WHERE usn = ? AND dob = ?', [usn, dob], async (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE users SET password = ? WHERE usn = ?', [hashedNewPassword, usn], (err, updateResults) => {
        if (err) throw err;
        res.send('Password reset successful');
      });
    } else {
      res.send('Invalid USN or DOB');
    }
  });
});

module.exports = router;
