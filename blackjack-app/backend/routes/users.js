// backend/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');


router.get('/', async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, username, role, balance, status, wins, totalGames, countAccuracy, correctCounts, totalCountAttempts FROM users WHERE role != 'guest'"
        );
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare pe server');
    }
});

router.put('/update', auth, async (req, res) => {
    try {
        const updates = req.body;
        const userId = req.user.id;

        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Utilizator inexistent' });
        
        let user = rows[0];

        if (updates.balance !== undefined) user.balance += updates.balance;
        if (updates.newName) user.username = updates.newName;
        if (updates.win) user.wins += 1;
        if (updates.gamePlayed) user.totalGames += 1;

        if (updates.countAttempted) {
            user.totalCountAttempts += 1;
            if (updates.countCorrect) user.correctCounts += 1;
            user.countAccuracy = Math.round((user.correctCounts / user.totalCountAttempts) * 100);
        }

        await db.query(`
            UPDATE users 
            SET username = ?, balance = ?, wins = ?, totalGames = ?, 
                correctCounts = ?, totalCountAttempts = ?, countAccuracy = ?
            WHERE id = ?
        `, [
            user.username, user.balance, user.wins, user.totalGames, 
            user.correctCounts, user.totalCountAttempts, user.countAccuracy, 
            userId
        ]);

        delete user.password;
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la actualizarea datelor');
    }
});


router.put('/admin/action', auth, async (req, res) => {
    try {
        const adminId = req.user.id;
        const { targetUserId, action, value } = req.body;

        
        const [adminRows] = await db.query('SELECT role FROM users WHERE id = ?', [adminId]);
        if (adminRows.length === 0 || adminRows[0].role !== 'admin') {
            return res.status(403).json({ msg: 'Acces interzis! Nu ai drepturi de administrator.' });
        }

        
        if (action === 'set-status') { // value poate fi 'activ' sau 'banat'
            await db.query('UPDATE users SET status = ? WHERE id = ?', [value, targetUserId]);
        } else if (action === 'set-role') { // value poate fi 'user' or 'admin'
            await db.query('UPDATE users SET role = ? WHERE id = ?', [value, targetUserId]);
        } else if (action === 'reset-balance') {
            await db.query('UPDATE users SET balance = 1000 WHERE id = ?', [targetUserId]);
        } else {
            return res.status(400).json({ msg: 'Acțiune administrativă invalidă.' });
        }

        
        const [users] = await db.query(
            "SELECT id, username, role, balance, status, wins, totalGames, countAccuracy, correctCounts, totalCountAttempts FROM users WHERE role != 'guest'"
        );
        res.json(users);

    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la executarea acțiunii administrative');
    }
});

module.exports = router;