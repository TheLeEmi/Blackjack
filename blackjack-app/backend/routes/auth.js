// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); 
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) return res.status(400).json({ msg: 'Utilizatorul există deja' });

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const [result] = await db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)', 
            [username, hashedPassword]
        );

        const userId = result.insertId;

        
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            token, 
            user: { id: userId, username, balance: 1000, role: 'user', status: 'activ' } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare pe server');
    }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(400).json({ msg: 'Credențiale invalide' });
        
        const user = rows[0];
        if (user.status === 'banat') return res.status(403).json({ msg: 'Cont banat!' });

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credențiale invalide' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        
        delete user.password;
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare pe server');
    }
    
});

router.get('/me', auth, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, role, balance, status FROM users WHERE id = ?', 
            [req.user.id]
        );
        
        if (rows.length === 0) return res.status(404).json({ msg: 'Utilizator inexistent' });
        
        const user = rows[0];
        
        if (user.status === 'banat') return res.status(403).json({ msg: 'Cont banat!' });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare pe server');
    }
});
module.exports = router;