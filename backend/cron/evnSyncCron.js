const cron = require('node-cron');
const axios = require('axios');
const mysql = require('mysql2/promise');

const TABLE_NAME = 'lich_cup_dien_hoan_chinh';

const DA_NANG_DIEN_LUC = [
  { name: 'Điện lực Hải Châu', code: 'PP0100' },
  { name: 'Điện lực Liên Chiểu', code: 'PP0300' },
  { name: 'Điện lực Sơn Trà - Ngũ Hành Sơn', code: 'PP0500' },
  { name: 'Điện lực Cẩm Lệ', code: 'PP0700' },
  { name: 'Điện lực Hòa Vang', code: 'PP0800' },
  { name: 'Điện lực Thanh Khê', code: 'PP0900' }
];

const DA_NANG_WARDS = [
  "Hải Châu I", "Hải Châu 1", "Hải Châu II", "Hải Châu 2", "Thạch Thang", "Thuận Phước", "Thanh Bình", "Hòa Thuận Tây", "Hòa Thuận Đông", "Nam Dương", "Phước Ninh", "Bình Thuận", "Bình Hiên", "Hòa Cường Bắc", "Hòa Cường Nam",
  "Vĩnh Trung", "Tân Chính", "Thạc Gián", "Chính Gián", "Tam Thuận", "Xuân Hà", "An Khê", "Hòa Khê", "Thanh Khê Đông", "Thanh Khê Tây",
  "An Hải Bắc", "An Hải Tây", "An Hải Đông", "Mân Thái", "Nại Hiên Đông", "Phước Mỹ", "Thọ Quang",
  "Hòa Hải", "Hòa Quý", "Khuê Mỹ", "Mỹ An",
  "Hòa Hiệp Bắc", "Hòa Hiệp Nam", "Hòa Khánh Bắc", "Hòa Khánh Nam", "Hòa Minh",
  "Hòa An", "Hòa Phát", "Hòa Thọ Đông", "Hòa Thọ Tây", "Hòa Xuân", "Khuê Trung",
  "Hòa Bắc", "Hòa Châu", "Hòa Tiến", "Hòa Phong", "Hòa Nhơn", "Hòa Phú", "Hòa Khương", "Hòa Sơn", "Hòa Ninh", "Hòa Liên", "Hòa Phước"
];

const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const extractWard = (text) => {
  if (!text) return 'Khác';
  const normalizedText = removeAccents(text.toLowerCase());
  
  for (const ward of DA_NANG_WARDS) {
    const normalizedWard = removeAccents(ward.toLowerCase());
    if (normalizedText.includes(normalizedWard)) {
      let finalWardName = ward;
      if (ward === 'Hải Châu 1') finalWardName = 'Hải Châu I';
      if (ward === 'Hải Châu 2') finalWardName = 'Hải Châu II';
      return "Phường " + finalWardName; // Thêm chữ Phường (Hòa Vang là Xã nhưng frontend sẽ hiển thị danh sách này, gom chung cũng ok)
    }
  }
  return 'Khác';
};

const syncEVNToMySQL = async () => {
  try {
    console.log("[Cron] Starting sync from EVN API to MySQL...");

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);
    
    const fromDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')} 00:00:00`;
    const toDate = `${future.getFullYear()}-${String(future.getMonth()+1).padStart(2,'0')}-${String(future.getDate()).padStart(2,'0')} 23:59:59`;

    let allOutages = [];

    for (const dl of DA_NANG_DIEN_LUC) {
      console.log(`[Cron] Fetching data for ${dl.name}...`);
      const url = `https://cskh-api.cpc.vn/api/remote/outages/area?orgCode=PP&subOrgCode=${dl.code}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&page=1&limit=500`;
      
      try {
        const response = await axios.get(url);
        if (response.data && response.data.items) {
          const items = response.data.items.map(item => {
            const ward = extractWard((item.stationName || "") + " " + (item.reason || ""));
            
            return {
              dienLuc: dl.name,
              phuongXa: ward.startsWith('Phường Hòa Bắc') || ward.startsWith('Phường Hòa Châu') || ward.startsWith('Phường Hòa Tiến') || ward.startsWith('Phường Hòa Phong') || ward.startsWith('Phường Hòa Nhơn') || ward.startsWith('Phường Hòa Phú') || ward.startsWith('Phường Hòa Khương') || ward.startsWith('Phường Hòa Sơn') || ward.startsWith('Phường Hòa Ninh') || ward.startsWith('Phường Hòa Liên') || ward.startsWith('Phường Hòa Phước') ? ward.replace('Phường', 'Xã') : ward,
              tenTram: item.stationName || 'Không xác định',
              tuNgay: item.fromDateStr || '', 
              denNgay: item.toDateStr || '',
              lyDo: item.reason || '',
              trangThai: item.statusStr || 'Đã duyệt',
              maTram: item.stationCode || ''
            };
          });
          allOutages = allOutages.concat(items);
        }
      } catch (err) {
        console.error(`[Cron] Failed to fetch data for ${dl.name}:`, err.message);
      }
    }

    if (allOutages.length === 0) {
      console.log("[Cron] No data fetched from EVN. Skipping MySQL update.");
      return;
    }

    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lich_cup_dien_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${TABLE_NAME}\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`dienLuc\` VARCHAR(255),
          \`phuongXa\` VARCHAR(255),
          \`tenTram\` VARCHAR(255),
          \`tuNgay\` VARCHAR(255),
          \`denNgay\` VARCHAR(255),
          \`lyDo\` TEXT,
          \`trangThai\` VARCHAR(255),
          \`maTram\` VARCHAR(255)
        )
      `;
      
      console.log(`[Cron] Checking/Creating table ${TABLE_NAME}...`);
      await connection.query(createTableQuery);

      console.log(`[Cron] Truncating table ${TABLE_NAME}...`);
      await connection.query(`TRUNCATE TABLE \`${TABLE_NAME}\``);

      console.log(`[Cron] Inserting ${allOutages.length} rows into ${TABLE_NAME}...`);
      
      const query = `INSERT INTO \`${TABLE_NAME}\` (dienLuc, phuongXa, tenTram, tuNgay, denNgay, lyDo, trangThai, maTram) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      for (const row of allOutages) {
        const values = [row.dienLuc, row.phuongXa, row.tenTram, row.tuNgay, row.denNgay, row.lyDo, row.trangThai, row.maTram];
        await connection.query(query, values);
      }

      await connection.commit();
      console.log("[Cron] Sync EVN to MySQL completed successfully!");
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
      await pool.end();
    }

  } catch (error) {
    console.error("[Cron] Failed to sync data from EVN to MySQL:", error.message);
  }
};

syncEVNToMySQL();

cron.schedule('*/30 * * * *', syncEVNToMySQL);

module.exports = {
  syncEVNToMySQL
};
