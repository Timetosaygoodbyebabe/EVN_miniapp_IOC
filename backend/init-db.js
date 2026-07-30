const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    // Kết nối vào MySQL nhưng chưa chọn Database nào cả
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Tạo Database nếu chưa có
    await connection.query("CREATE DATABASE IF NOT EXISTS `lich_cup_dien_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;");
    
    console.log("✅ Tạo Database 'lich_cup_dien_db' thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo Database:", error);
    process.exit(1);
  }
}

createDatabase();
