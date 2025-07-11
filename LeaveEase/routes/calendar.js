const express = require('express');
const router = express.Router();
const db = require('../db');

// Promisify db.query
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Get student events for a date range
router.get('/student/events', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        const sql = `
            SELECT 
                e.id,
                e.title,
                e.start_date,
                e.end_date,
                e.event_type,
                e.description
            FROM events e
            WHERE 
                (e.start_date BETWEEN ? AND ?) OR
                (e.end_date BETWEEN ? AND ?) OR
                (? BETWEEN e.start_date AND e.end_date)
            ORDER BY e.start_date ASC
        `;
        
        const events = await queryAsync(sql, [start, end, start, end, start]);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create a new leave request
router.post('/leave/request', async (req, res) => {
    try {
        const { userId, startDate, endDate, leaveType, reason } = req.body;
        
        if (!userId || !startDate || !endDate || !leaveType || !reason) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const sql = `
            INSERT INTO leave_requests 
            (user_id, start_date, end_date, leave_type, reason, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        
        await queryAsync(sql, [userId, startDate, endDate, leaveType, reason]);
        res.json({ message: 'Leave request submitted successfully' });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ error: 'Failed to submit leave request' });
    }
});

// Get user's leave balance
router.get('/leave/balance/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sql = `
            SELECT 
                leave_type,
                total_days,
                used_days,
                (total_days - used_days) as remaining_days
            FROM leave_balances
            WHERE user_id = ?
        `;
        
        const balance = await queryAsync(sql, [userId]);
        res.json(balance);
    } catch (error) {
        console.error('Error fetching leave balance:', error);
        res.status(500).json({ error: 'Failed to fetch leave balance' });
    }
});

module.exports = router; 