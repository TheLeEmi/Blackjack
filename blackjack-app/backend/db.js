// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            balance INT DEFAULT 1000,
            status VARCHAR(50) DEFAULT 'activ',
            wins INT DEFAULT 0,
            totalGames INT DEFAULT 0,
            correctCounts INT DEFAULT 0,
            totalCountAttempts INT DEFAULT 0,
            countAccuracy INT DEFAULT 0
        )
    `;
    try {
        await pool.query(query);
        console.log("✅ Tabelul 'users' este pregătit în MySQL.");
    } catch (err) {
        console.error("❌ Eroare la crearea tabelului:", err);
    }
};

createTable();

module.exports = pool;