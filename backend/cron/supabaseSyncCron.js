const cron = require('node-cron');
const axios = require('axios');
const mysql = require('mysql2/promise');

const TABLE_NAME = 'lich_cup_dien_hoan_chinh';

const syncSupabaseToMySQL = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Cron] Missing SUPABASE_URL or SUPABASE_KEY in environment variables. Skipping sync.");
    return;
  }

  try {
    console.log("[Cron] Starting sync from Supabase to MySQL...");

    // 1. Fetch data from Supabase (up to 10000 rows to ensure we get everything)
    const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}?select=*&limit=10000`;
    const response = await axios.get(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      console.log("[Cron] No data found in Supabase or data is empty. Skipping MySQL update.");
      return;
    }

    // 2. Connect to MySQL
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lich_cup_dien_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Clear existing table data and insert new data
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      console.log(`[Cron] Truncating table ${TABLE_NAME}...`);
      await connection.query(`TRUNCATE TABLE ${TABLE_NAME}`);

      console.log(`[Cron] Inserting ${data.length} rows into ${TABLE_NAME}...`);
      
      const columns = Object.keys(data[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const query = `INSERT INTO ${TABLE_NAME} (${columns.join(', ')}) VALUES (${placeholders})`;

      for (const row of data) {
        const values = columns.map(col => row[col]);
        await connection.query(query, values);
      }

      await connection.commit();
      console.log("[Cron] Sync completed successfully!");
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
      await pool.end();
    }

  } catch (error) {
    console.error("[Cron] Failed to sync data from Supabase to MySQL:", error.message);
  }
};

// Run immediately on startup
syncSupabaseToMySQL();

// Then run every 1 hour
cron.schedule('0 * * * *', syncSupabaseToMySQL);

module.exports = {
  syncSupabaseToMySQL
};
