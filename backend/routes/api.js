const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lich_cup_dien_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const TABLE_NAME = 'lich_cup_dien_hoan_chinh';

// 1. Get DienLuc list
router.get('/dienluc', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT DISTINCT dienLuc FROM ${TABLE_NAME} WHERE dienLuc IS NOT NULL`);
    const data = rows.map(r => r.dienLuc);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get PhuongXa list
router.get('/phuongxa', async (req, res) => {
  try {
    const { dienLuc } = req.query;
    if (!dienLuc) return res.json([]);
    const [rows] = await pool.query(`SELECT DISTINCT phuongXa FROM ${TABLE_NAME} WHERE phuongXa IS NOT NULL AND dienLuc = ?`, [dienLuc]);
    const data = rows.map(r => r.phuongXa);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Tram list
router.get('/tram', async (req, res) => {
  try {
    const { dienLuc, phuongXa } = req.query;
    if (!dienLuc || !phuongXa) return res.json([]);
    const [rows] = await pool.query(`SELECT DISTINCT tenTram FROM ${TABLE_NAME} WHERE tenTram IS NOT NULL AND dienLuc = ? AND phuongXa = ?`, [dienLuc, phuongXa]);
    const data = rows.map(r => r.tenTram);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Search
router.post('/search', async (req, res) => {
  try {
    const { dienLuc, phuongXa, tram, date } = req.body;
    
    let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
    const params = [];

    if (dienLuc) {
      query += ` AND dienLuc = ?`;
      params.push(dienLuc);
    }
    if (phuongXa) {
      query += ` AND phuongXa = ?`;
      params.push(phuongXa);
    }
    if (tram && Array.isArray(tram) && tram.length > 0) {
      const placeholders = tram.map(() => '?').join(',');
      query += ` AND tenTram IN (${placeholders})`;
      params.push(...tram);
    }

    if (date && Array.isArray(date) && date.length > 0) {
      // Create OR conditions for tuNgay
      const dateConditions = date.map(d => {
        // d format: YYYY-MM-DD
        const [yyyy, mm, dd] = d.split('-');
        return `tuNgay LIKE ?`;
      });
      query += ` AND (${dateConditions.join(' OR ')})`;
      
      date.forEach(d => {
        const [yyyy, mm, dd] = d.split('-');
        params.push(`%${dd}/${mm}/${yyyy}%`);
      });
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
