// server/db.js - PostgreSQL Connection Pool with Mock DB Fallback + Auth Support
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const { Pool } = pg;

let pool;
let useMock = false;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

try {
  if (connectionString) {
    try {
      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await pool.query('SELECT 1');
    } catch (sslErr) {
      if (sslErr.message && sslErr.message.includes('does not support SSL')) {
        pool = new Pool({
          connectionString,
          ssl: false,
          connectionTimeoutMillis: 5000,
        });
        await pool.query('SELECT 1');
      } else {
        throw sslErr;
      }
    }
  } else if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    pool = new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'postgres',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl:      { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    await pool.query('SELECT 1');
  } else {
    pool = new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'postgres',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '1234',
      connectionTimeoutMillis: 2000,
    });
    await pool.query('SELECT 1');
  }
  console.log('✅ Connected to PostgreSQL');
} catch (err) {
  console.warn('⚠️ PostgreSQL connection failed:', err.message);
  console.warn('   Falling back to in-memory Mock DB');
  useMock = true;
  pool = null;
}

// =============================================
// IN-MEMORY MOCK DATABASE
// =============================================
const mockDB = {
  users: [],
  courts: [
    { id: 1, name: 'Sân cầu lông Đức Thảo',            address: '18 Tam Trinh, Tương Mai, Hai Bà Trưng, Hà Nội', district: 'Hai Bà Trưng', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/JyDGXTP6H59iKgS89' },
    { id: 2, name: 'Trung Tâm TDTT Sân câu lông',       address: '521 Phố Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội', district: 'Hai Bà Trưng', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/m3DisHu6jU776tiL7' },
    { id: 3, name: 'Net Sport Center',                 address: '18 Đường Tam Trinh, Tương Mai, Hai Bà Trưng, Hà Nội', district: 'Hai Bà Trưng', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/yKXKq8TNrHdk4Pkq7' },
    { id: 4, name: 'NTĐ Bách Khoa',                     address: '02 Lê Thanh Nghị, Bách Khoa, Hai Bà Trưng, Hà Nội', district: 'Hai Bà Trưng', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/zLNHkAFCxqkrTefH8' },
    { id: 5, name: 'Sân Cầu Lông Tiến Dinh Sport',     address: 'Ngách 1, Ngõ 147A Tân Mai, Hoàng Mai, Hà Nội', district: 'Hoàng Mai', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/Yw828MjQxJzj24vi6' },
    { id: 6, name: 'Sân cầu lông Nhà thi đấu Đền Lừ',  address: 'Khu vực Hồ Đền Lừ 3, Phường Hoàng Văn Thụ, Hoàng Mai, Hà Nội', district: 'Hoàng Mai', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/gyA95PAryFao5dWv7' },
    { id: 7, name: 'Sân Cầu Lông Phương Linh',          address: '151 P. Yên Duyên, Phường Yên Sở, Hoàng Mai, Hà Nội', district: 'Hoàng Mai', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/9KMZnCowpA2ZzTPw7' },
    { id: 8, name: 'Nhà thi đấu Hoàng Mai',            address: 'Phường Định Công, Hoàng Mai, Hà Nội', district: 'Hoàng Mai', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/XXFumxDGKtTLpiaUA' },
    { id: 9, name: 'CLB Cầu Lông Hải Lâm',             address: 'Phường Vĩnh Hưng, Hoàng Mai, Hà Nội', district: 'Hoàng Mai', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/oL25TmiDUcwoy2u5A' },
    { id: 10, name: 'Sân Cầu Lông Quốc Việt',           address: 'Hoàng Mai, Hà Nội', district: 'Hoàng Mai', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/pB3jHR6QLHPwwbsa7' },
    { id: 11, name: 'Sân Cầu Lông Nhà thi đấu Cầu Giấy', address: 'Số 35 Trần Quý Kiên, Dịch Vọng, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Nhà+Thi+Đấu+Cầu+Giấy+35+Trần+Quý+Kiên' },
    { id: 12, name: 'Sân cầu lông Trường THPT Yên Hòa', address: 'Ngõ 251 Nguyễn Khang, Yên Hòa, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+THPT+Yên+Hòa+251+Nguyễn+Khang' },
    { id: 13, name: 'Sân cầu lông Phan Văn Trường',    address: 'Ngõ 77 Phan Văn Trường, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Phan+Văn+Trường+Ngõ+77' },
    { id: 14, name: 'Sân cầu lông Trường Tiểu học Yên Hòa', address: 'Số 108 Hạ Yên Quyết, Yên Hòa, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Tiểu+Học+Yên+Hòa+108+Hạ+Yên+Quyết' },
    { id: 15, name: 'Sân cầu lông Trường Đại học Giao thông vận tải', address: 'Số 3 Cầu Giấy, Láng Thượng, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Giao+Thông+Vận+Tải' },
    { id: 16, name: 'Sân cầu lông Trần Duy Hưng',       address: 'Số 180 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+180+Trần+Duy+Hưng' },
    { id: 17, name: 'Sân cầu lông Đại học Sư phạm',    address: 'Số 136 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Sư+Phạm+136+Xuân+Thủy' },
    { id: 18, name: 'Sân cầu lông Trường THCS Nghĩa Tân', address: 'Số 14 Tô Hiệu, Dịch Vọng, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+THCS+Nghĩa+Tân+14+Tô+Hiệu' },
    { id: 19, name: 'Sân cầu lông Mai Dịch',          address: 'Trần Tử Bình, Mai Dịch, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Mai+Dịch+Trần+Tử+Bình' },
    { id: 20, name: 'Sân cầu lông Học viện chính trị quốc gia Hồ Chí Minh', address: 'Ngõ 134 Nguyễn Phong Sắc, Dịch Vọng, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Học+Viện+Chính+Trị+Nguyễn+Phong+Sắc' },
    { id: 21, name: 'Sân cầu lông Trường THPT Lý Thái Tổ', address: 'Số 165 Hoàng Ngân, Trung Hòa, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+THPT+Lý+Thái+Tổ+165+Hoàng+Ngân' },
    { id: 22, name: 'Sân cầu lông Nguyễn Văn Huyên',    address: 'Số 85 Nguyễn Văn Huyên, Quan Hoa, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+85+Nguyễn+Văn+Huyên' },
    { id: 23, name: 'Sân cầu lông Minh Toàn',           address: 'Đường Hạ Yên Quyết, Yên Hòa, Cầu Giấy, Hà Nội', district: 'Cầu Giấy', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Minh+Toàn+Yên+Hòa' },
    { id: 24, name: 'Sân cầu lông Khuất Duy Tiến Center', address: 'Số 166 Khuất Duy Tiến, Nhân Chính, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Khuất+Duy+Tiến+166' },
    { id: 25, name: 'Sân cầu lông Đại học Hà Nội',      address: 'Số 264 Nguyễn Trãi, Trung Văn, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Hà+Nội+264+Nguyễn+Trãi' },
    { id: 26, name: 'Sân cầu lông Khương Đình',         address: 'Ngõ 460 Khương Đình, Hạ Đình, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Khương+Đình+Ngõ+460' },
    { id: 27, name: 'Sân cầu lông Quan Nhân',           address: 'Ngõ 144 Quan Nhân, Nhân Chính, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Quan+Nhân+Ngõ+144' },
    { id: 28, name: 'Sân cầu lông Vũ Hữu',              address: 'Ngõ 12 Vũ Hữu, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Vũ+Hữu+Ngõ+12' },
    { id: 29, name: 'Sân cầu lông Lê Văn Lương',         address: 'Số 88 Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Lê+Văn+Lương+88' },
    { id: 30, name: 'Sân cầu lông Nguyễn Tuân',          address: 'Số 90 Nguyễn Tuân, Thanh Xuân Trung, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Nguyễn+Tuân+90' },
    { id: 31, name: 'Sân cầu lông Kim Giang',           address: 'Số 320 Kim Giang, Đại Kim, Thanh Xuân, Hà Nội', district: 'Thanh Xuân', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Kim+Giang+320' },
    { id: 32, name: 'Sân cầu lông Việt Hưng',           address: 'KĐT Việt Hưng, Giang Biên, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Việt+Hưng+Long+Biên' },
    { id: 33, name: 'Sân cầu lông Long Biên Arena',      address: 'Số 5 Đức Giang, Đức Giang, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Long+Biên+Arena+5+Đức+Giang' },
    { id: 34, name: 'Sân cầu lông Bồ Đề',                address: 'Ngõ 264 Bồ Đề, Bồ Đề, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Bồ+Đề+Ngõ+264' },
    { id: 35, name: 'Sân cầu lông Ngọc Lâm',             address: 'Ngõ 154 Ngọc Lâm, Ngọc Lâm, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Ngọc+Lâm+Ngõ+154' },
    { id: 36, name: 'Sân cầu lông Thạch Bàn',            address: 'Phố Thạch Bàn, Thạch Bàn, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Thạch+Bàn+Long+Biên' },
    { id: 37, name: 'Sân cầu lông Phúc Lợi',             address: 'Phố Phúc Lợi, Phúc Lợi, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Phúc+Lợi+Long+Biên' },
    { id: 38, name: 'Sân cầu lông Sài Đồng',             address: 'KĐT Sài Đồng, Sài Đồng, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Sài+Đồng+Long+Biên' },
    { id: 39, name: 'Sân cầu lông Gia Thụy',             address: 'Ngõ 564 Nguyễn Văn Cừ, Gia Thụy, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Gia+Thụy+564+Nguyễn+Văn+Cừ' },
    { id: 40, name: 'Sân cầu lông Thượng Thanh',         address: 'Ngõ 99 Lý Sơn, Thượng Thanh, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Thượng+Thanh+Lý+Sơn' },
    { id: 41, name: 'Sân cầu lông Cự Khối',              address: 'Đường Đập Cự Khối, Cự Khối, Long Biên, Hà Nội', district: 'Long Biên', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Cự+Khối+Long+Biên' },
    { id: 42, name: 'Sân Cầu Lông La Khê',              address: 'Làng La Khê, đường Lê Trọng Tấn, Phường La Khê, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/FVRvCAy8K3UkovHK7' },
    { id: 43, name: 'Trung Tâm Thể Thao Duy Hưng Cơ Sở Hà Đông', address: 'Khu Dịch Vụ Dọc Bún 1, Phường La Khê, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/hCK2cBKLYCC2aWmr8' },
    { id: 44, name: 'Sân Cầu Lông Thắng Lĩnh Badminton', address: '948 Đ. Quang Trung, Ba La, Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/1bKWAjdQ3oNB8SzL7' },
    { id: 45, name: 'Sân Cầu Lông Nhà Thi Đấu Hà Đông',  address: 'Số 182 Đường Quang Trung, Phường Quang Trung, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/hTAcTr2Hafv8Vz39A' },
    { id: 46, name: 'Sân Cầu Lông Tổ 9 Đồng Mai',       address: 'Tổ 9, Phường Đồng Mai, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/Ske6XSj5BkXWWjf76' },
    { id: 47, name: 'Sân Cầu Lông Trường THPT Lê Lợi',  address: 'Số 72 Bà Triệu, Phường Hà Cầu, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/pfWbVVftZMyYsAJJ8' },
    { id: 48, name: 'Sân Cầu Lông Trường THCS Lê Quý Đôn', address: 'Khu đô thị An Hưng, Phường Dương Nội, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/JJ39C2k9wQLBNmg86' },
    { id: 49, name: 'Sân Cầu Lông Trường Chuyên Nguyễn Huệ', address: 'Đường Tố Hữu, Phường La Khê, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/L4mBKN89ALotHFYG9' },
    { id: 50, name: 'Sân Cầu Lông Cây Đề',              address: 'Số 75 Văn Nội, Phường Phú Lương, Quận Hà Đông, Hà Nội', district: 'Hà Đông', city: 'Hà Nội', maps_url: 'https://maps.app.goo.gl/YM3QYZ27Qf8zYG1D6' },
    { id: 51, name: 'Sân cầu lông Đại học Ngoại Thương', address: 'Nhà thi đấu ĐH Ngoại Thương, 91 Chùa Láng, Đống Đa, Hà Nội', district: 'Đống Đa', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Ngoại+Thương+91+Chùa+Láng' },
    { id: 52, name: 'Sân cầu lông Đại học Công Đoàn (Victor)', address: '169 Tây Sơn, Quang Trung, Đống Đa, Hà Nội', district: 'Đống Đa', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Công+Đoàn+169+Tây+Sơn' },
    { id: 53, name: 'Sân cầu lông Ban Cơ yếu Chính phủ', address: '107 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội', district: 'Đống Đa', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Ban+Cơ+Yếu+Chính+Phủ+107+Nguyễn+Chí+Thanh' },
    { id: 54, name: 'Sân cầu lông Nhà thi đấu Đại học Thủy Lợi', address: '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội', district: 'Đống Đa', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Thủy+Lợi+175+Tây+Sơn' },
    { id: 55, name: 'Sân cầu lông Học viện Ngân hàng', address: 'Số 12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội', district: 'Đống Đa', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Học+Viện+Ngân+Hàng+12+Chùa+Bộc' },
    { id: 56, name: 'Sân cầu lông Fleet Hồ Đắc Di',     address: 'Ngõ 141 Hồ Đắc Di, Nam Đồng, Đống Đa, Hà Nội', district: 'Đống Đa', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Fleet+141+Hồ+Đắc+Di' },
    { id: 57, name: 'Sân cầu lông BOP Phạm Hồng Thái', address: '01 Nguyễn Văn Ngọc, Cống Vị, Ba Đình, Hà Nội', district: 'Ba Đình', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Phạm+Hồng+Thái+01+Nguyễn+Văn+Ngọc' },
    { id: 58, name: 'Sân cầu lông Bệnh viện 354',      address: '120 Phố Đốc Ngữ, Vĩnh Phúc, Ba Đình, Hà Nội', district: 'Ba Đình', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Bệnh+Viện+354+120+Đốc+Ngữ' },
    { id: 59, name: 'Sân cầu lông Quán Thánh',         address: '115 Quán Thánh, Ba Đình, Hà Nội', district: 'Ba Đình', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+115+Quán+Thánh' },
    { id: 60, name: 'Sân cầu lông Nhà thi đấu Tây Hồ', address: '101 Đường Xuân La, Xuân La, Tây Hồ, Hà Nội', district: 'Tây Hồ', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Nhà+Thi+Đấu+Tây+Hồ+101+Xuân+La' },
    { id: 61, name: 'Sân cầu lông Số 6 Đặng Thai Mai', address: 'Số 6 Phố Đặng Thai Mai, Quảng An, Tây Hồ, Hà Nội', district: 'Tây Hồ', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+6+Đặng+Thai+Mai' },
    { id: 62, name: 'Sân cầu lông An Dương',           address: 'Ngõ 76 An Dương, Yên Phụ, Tây Hồ, Hà Nội', district: 'Tây Hồ', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+An+Dương+Ngõ+76' },
    { id: 63, name: 'Sân cầu lông VNBC Phú Diễn',      address: '158 Phú Diễn, Cầu Diễn, Nam Từ Liêm, Hà Nội', district: 'Nam Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+VNBC+158+Phú+Diễn' },
    { id: 64, name: 'Sân cầu lông Mỹ Đình',           address: 'Đường Mỹ Đình, Mỹ Đình 2, Nam Từ Liêm, Hà Nội', district: 'Nam Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Mỹ+Đình' },
    { id: 65, name: 'Sân cầu lông Tây Mỗ',             address: 'Đường Nhuệ Giang, Tây Mỗ, Nam Từ Liêm, Hà Nội', district: 'Nam Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Tây+Mỗ+Nhuệ+Giang' },
    { id: 66, name: 'Sân cầu lông Xuân Đỉnh',          address: '176-178 Xuân Đỉnh, Phường Xuân Đỉnh, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Xuân+Đỉnh+176' },
    { id: 67, name: 'Sân cầu lông Trường Tiểu học Đức Thắng', address: 'Phường Đức Thắng, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Tiểu+Học+Đức+Thắng' },
    { id: 68, name: 'Sân cầu lông LD Badminton',       address: 'Đường Trại Gà, Phường Đông Ngạc, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+LD+Badminton+Trại+Gà' },
    { id: 69, name: 'Sân cầu lông Học viện Tài chính', address: 'Số 58 Lê Văn Hiến, Phường Đức Thắng, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Học+Viện+Tài+Chính+58+Lê+Văn+Hiến' },
    { id: 70, name: 'Sân cầu lông CTA Badminton',      address: 'Số 99 Ngõ 2 Đường Phan Bá Vành, Cầu Diễn, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+CTA+Badminton+Phan+Bá+Vành' },
    { id: 71, name: 'Sân cầu lông US Badminton',       address: 'Đường CN3 Cụm công nghiệp Từ Liêm, Trịnh Văn Bô, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+US+Badminton+Trịnh+Văn+Bô' },
    { id: 72, name: 'Sân cầu lông Hoàng Huy (HH)',     address: '451 Ngõ 68 Đường Phú Diễn, Phường Phú Diễn, Bắc Từ Liêm, Hà Nội', district: 'Bắc Từ Liêm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Hoàng+Huy+Phú+Diễn' },
    { id: 73, name: 'Sân cầu lông 3T',                address: 'Số 96 Tựu Liệt, Thị trấn Văn Điển, Thanh Trì, Hà Nội', district: 'Thanh Trì', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+3T+96+Tựu+Liệt' },
    { id: 74, name: 'Sân cầu lông 1991 Club',         address: '286 Nguyễn Xiển, Triều Khúc, Thanh Trì, Hà Nội', district: 'Thanh Trì', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+1991+Club+286+Nguyễn+Xiển' },
    { id: 75, name: 'Sân cầu lông Vina Badminton (Tổng Cục 5)', address: 'Đường số 1, Tổng cục 5, Tân Triều, Thanh Trì, Hà Nội', district: 'Thanh Trì', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Vina+Badminton+Tổng+Cục+5' },
    { id: 76, name: 'Sân cầu lông HG',                address: 'Ngõ 512 Ngọc Hồi, Vĩnh Quỳnh, Thanh Trì, Hà Nội', district: 'Thanh Trì', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+HG+512+Ngọc+Hồi' },
    { id: 77, name: 'Sân cầu lông Sao Vàng',          address: 'Đường Phạm Tu, Tân Triều, Thanh Trì, Hà Nội', district: 'Thanh Trì', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Sao+Vàng+Phạm+Tu' },
    { id: 78, name: 'Sân cầu lông Nhà thi đấu Gia Lâm', address: '437 Nguyễn Đức Thuận, Trâu Quỳ, Gia Lâm, Hà Nội', district: 'Gia Lâm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Nhà+Thi+Đấu+Gia+Lâm' },
    { id: 79, name: 'Sân cầu lông Cửu Việt',          address: 'Khu Cửu Việt, Trâu Quỳ, Gia Lâm, Hà Nội', district: 'Gia Lâm', city: 'Hà Nội', maps_url: 'https://maps.google.com/?q=Sân+Cầu+Lông+Cửu+Việt+Trâu+Quỳ' },
  ],
  matches: [],
  participants: [],
  nextUserId: 1,
  nextMatchId: 1,
  nextParticipantId: 1,
};

// =============================================
// SEED MOCK DATA
// =============================================
async function seedMockDB() {
  // --- Seed Users (passwords are all "password123") ---
  const hash = await bcrypt.hash('password123', 10);
  mockDB.users = [
    {
      id: 1, full_name: 'Minh Host', username: 'minh.host', email: 'minh.host@example.com',
      password_hash: hash, role: 'user', gender: 'male',
      phone: '0912345678', skill_level: 'Khá/Tốt',
      city: 'Hà Nội', avatar_color: '#00F5C4', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2, full_name: 'Long Pro', username: 'long.pro', email: 'long.pro@example.com',
      password_hash: hash, role: 'user', gender: 'male',
      phone: '0987654321', skill_level: 'Khá/Tốt',
      city: 'Hà Nội', avatar_color: '#AAFF00', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3, full_name: 'Nguyễn Thị Mai', username: 'mai.player', email: 'mai.player@example.com',
      password_hash: hash, role: 'user', gender: 'female',
      phone: '0901112233', skill_level: 'Trung bình',
      city: 'Hà Nội', avatar_color: '#EC4899', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 4, full_name: 'Nam Sài Gòn', username: 'nam.sgn', email: 'nam.sgn@example.com',
      password_hash: hash, role: 'user', gender: 'male',
      phone: '0977665544', skill_level: 'Khá/Tốt',
      city: 'TP.HCM', avatar_color: '#7C3AED', is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 5, full_name: 'Trần Thị Lan', username: 'lan.player', email: 'lan.player@example.com',
      password_hash: hash, role: 'user', gender: 'female',
      phone: '0944556677', skill_level: 'Mới chơi',
      city: 'TP.HCM', avatar_color: '#F97316', is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
  mockDB.nextUserId = 6;

  // --- Seed Matches ---
  const today = new Date();
  const fmt = (d) => { const n = new Date(today); n.setDate(today.getDate() + d); return n.toISOString().split('T')[0]; };

  mockDB.matches = [
    { id: 1, title: 'Kèo Sáng Sớm Ba Đình - Trung Bình', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 1, court_name: 'Sân Cầu Lông Viettel', district: 'Ba Đình', city: 'Hà Nội', play_date: fmt(1), start_time: '06:00', end_time: '08:00', max_slots: 8, cost_per_slot: 60000, shuttlecock: 'Ba Sao', skill_level: 'Trung bình', note: 'Đánh nhẹ nhàng, thân thiện. Cọc 50k qua chuyển khoản.', bank_name: 'VCB', bank_account: '1234567890', bank_owner: 'NGUYEN VAN MINH', status: 'open', created_at: new Date().toISOString() },
    { id: 2, title: 'Kèo Chiều Đống Đa - Khá/Tốt - Cần Thêm 2 Người!', host_name: 'Long Pro', host_phone: '0987654321', host_id: 2, court_id: 2, court_name: 'Sân Cầu Lông Khâm Thiên', district: 'Đống Đa', city: 'Hà Nội', play_date: fmt(1), start_time: '17:00', end_time: '19:00', max_slots: 6, cost_per_slot: 80000, shuttlecock: 'Hải Yến', skill_level: 'Khá/Tốt', note: 'Kèo dành cho người đã có nền tảng. Cọc 60k.', bank_name: 'MB Bank', bank_account: '9876543210', bank_owner: 'TRAN VAN LONG', status: 'open', created_at: new Date().toISOString() },
    { id: 3, title: 'Kèo Tối Thứ 7 Cầu Giấy - Tất cả Trình Độ', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 3, court_name: 'Sân Cầu Lông Cầu Giấy Sport', district: 'Cầu Giấy', city: 'Hà Nội', play_date: fmt(2), start_time: '19:30', end_time: '21:30', max_slots: 10, cost_per_slot: 70000, shuttlecock: 'Thành Công', skill_level: 'Tất cả trình độ', note: 'Kèo mở cho mọi trình độ. Cọc 50k.', bank_name: 'Techcombank', bank_account: '5544332211', bank_owner: 'LE HUNG', status: 'open', created_at: new Date().toISOString() },
    { id: 4, title: 'Kèo Cuối Tuần Long Biên - Trung Bình', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 4, court_name: 'Sân Cầu Lông Long Biên Arena', district: 'Long Biên', city: 'Hà Nội', play_date: fmt(3), start_time: '07:00', end_time: '09:00', max_slots: 8, cost_per_slot: 55000, shuttlecock: 'Ba Sao', skill_level: 'Trung bình', note: 'Đánh theo cặp, xoay vòng vui vẻ. Cọc 40k.', bank_name: 'ACB', bank_account: '6677889900', bank_owner: 'NGUYEN VAN TUAN', status: 'open', created_at: new Date().toISOString() },
    { id: 5, title: 'Kèo TP.HCM - Kỳ Hòa Quận 1 - Sáng Chủ Nhật', host_name: 'Nam Sài Gòn', host_phone: '0977665544', host_id: 4, court_id: 5, court_name: 'Sân Kỳ Hòa', district: 'Quận 1', city: 'TP.HCM', play_date: fmt(2), start_time: '08:00', end_time: '10:30', max_slots: 12, cost_per_slot: 90000, shuttlecock: 'Hải Yến', skill_level: 'Khá/Tốt', note: 'Sân xịn Quận 1, đánh nghiêm túc. Cọc 70k.', bank_name: 'VCB', bank_account: '1122334455', bank_owner: 'TRAN NAM', status: 'open', created_at: new Date().toISOString() },
    { id: 6, title: 'Kèo HCM - Celadon Thủ Đức - Chiều Thứ 6', host_name: 'Nam Sài Gòn', host_phone: '0977665544', host_id: 4, court_id: 6, court_name: 'Sân Cầu Lông Celadon City', district: 'Thủ Đức', city: 'TP.HCM', play_date: fmt(1), start_time: '16:00', end_time: '18:00', max_slots: 8, cost_per_slot: 65000, shuttlecock: 'Ba Sao', skill_level: 'Mới chơi', note: 'Kèo vui vẻ, không áp lực.', bank_name: 'MB Bank', bank_account: '3344556677', bank_owner: 'NGUYEN HUNG', status: 'open', created_at: new Date().toISOString() },
    { id: 7, title: 'Kèo Đà Nẵng - Hải Châu - Tối Thứ 4', host_name: 'Phong Đà Nẵng', host_phone: '0922334455', host_id: null, court_id: 7, court_name: 'Sân Cầu Lông Hoàng Long', district: 'Hải Châu', city: 'Đà Nẵng', play_date: fmt(1), start_time: '19:00', end_time: '21:00', max_slots: 8, cost_per_slot: 60000, shuttlecock: 'Ba Sao', skill_level: 'Trung bình', note: 'Kèo thường xuyên mỗi thứ 4, chào đón người mới!', bank_name: 'VietinBank', bank_account: '8899001122', bank_owner: 'LE VAN PHONG', status: 'open', created_at: new Date().toISOString() },
    { id: 8, title: 'Kèo Hà Nội Ba Đình - Tối Thứ 3 - ĐÃ ĐỦ NGƯỜI', host_name: 'Minh Host', host_phone: '0912345678', host_id: 1, court_id: 1, court_name: 'Sân Cầu Lông Viettel', district: 'Ba Đình', city: 'Hà Nội', play_date: fmt(1), start_time: '20:00', end_time: '22:00', max_slots: 6, cost_per_slot: 75000, shuttlecock: 'Hải Yến', skill_level: 'Khá/Tốt', note: 'Kèo đã đủ người chính thức. Vẫn có thể đăng ký dự bị.', bank_name: 'VCB', bank_account: '7788990011', bank_owner: 'PHAM VAN DUNG', status: 'open', created_at: new Date().toISOString() },
  ];
  mockDB.nextMatchId = 9;

  mockDB.participants = [
    { id: 1, match_id: 1, player_name: 'Nguyễn Văn An',    player_phone: '0911111111', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'paid',    queue_order: 1, registered_at: new Date().toISOString() },
    { id: 2, match_id: 1, player_name: 'Trần Thị Bình',    player_phone: '0922222222', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'paid',    queue_order: 2, registered_at: new Date().toISOString() },
    { id: 3, match_id: 1, player_name: 'Lê Văn Cường',     player_phone: '0933333333', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'pending', queue_order: 3, registered_at: new Date().toISOString() },
    { id: 4, match_id: 1, player_name: 'Phạm Thị Dung',    player_phone: '0944444444', skill_level: 'Mới chơi',   status: 'confirmed', deposit_status: 'paid',    queue_order: 4, registered_at: new Date().toISOString() },
    { id: 5, match_id: 1, player_name: 'Hoàng Văn Em',     player_phone: '0955555555', skill_level: 'Trung bình', status: 'confirmed', deposit_status: 'pending', queue_order: 5, registered_at: new Date().toISOString() },
    { id: 6, match_id: 2, player_name: 'Vũ Thị Phương',    player_phone: '0966666666', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 1, registered_at: new Date().toISOString() },
    { id: 7, match_id: 2, player_name: 'Đặng Văn Quang',   player_phone: '0977777777', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 2, registered_at: new Date().toISOString() },
    { id: 8, match_id: 2, player_name: 'Bùi Thị Hoa',      player_phone: '0988888888', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 3, registered_at: new Date().toISOString() },
    { id: 9, match_id: 2, player_name: 'Đỗ Văn Hùng',      player_phone: '0999999999', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'pending', queue_order: 4, registered_at: new Date().toISOString() },
    { id:10, match_id: 8, player_name: 'Nguyễn Minh Tuấn', player_phone: '0911221133', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 1, registered_at: new Date().toISOString() },
    { id:11, match_id: 8, player_name: 'Lê Thành Nam',      player_phone: '0922332244', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 2, registered_at: new Date().toISOString() },
    { id:12, match_id: 8, player_name: 'Trần Đức Anh',      player_phone: '0933443355', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 3, registered_at: new Date().toISOString() },
    { id:13, match_id: 8, player_name: 'Phạm Văn Hải',      player_phone: '0944554466', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 4, registered_at: new Date().toISOString() },
    { id:14, match_id: 8, player_name: 'Hoàng Trung Kiên',  player_phone: '0955665577', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'paid',    queue_order: 5, registered_at: new Date().toISOString() },
    { id:15, match_id: 8, player_name: 'Vũ Quốc Bảo',       player_phone: '0966776688', skill_level: 'Khá/Tốt',   status: 'confirmed', deposit_status: 'pending', queue_order: 6, registered_at: new Date().toISOString() },
    { id:16, match_id: 8, player_name: 'Đỗ Huy Hoàng',      player_phone: '0977887799', skill_level: 'Khá/Tốt',   status: 'waitlist',  deposit_status: 'pending', queue_order: 7, registered_at: new Date().toISOString() },
    { id:17, match_id: 8, player_name: 'Bùi Thanh Long',     player_phone: '0988998800', skill_level: 'Trung bình', status: 'waitlist',  deposit_status: 'pending', queue_order: 8, registered_at: new Date().toISOString() },
  ];
  mockDB.nextParticipantId = 18;
}

await seedMockDB();

// =============================================
// USER CRUD (Mock)
// =============================================
function findUserByEmail(term) {
  if (!term) return null;
  const target = term.toString().toLowerCase();
  return mockDB.users.find(u =>
    (u.username && u.username.toLowerCase() === target) ||
    (u.email && u.email.toLowerCase() === target)
  ) || null;
}

function findUserById(id) {
  return mockDB.users.find(u => u.id === parseInt(id)) || null;
}

function createUser(data) {
  const username = data.username || data.email || '';
  const email = data.email || username;
  const user = {
    id: mockDB.nextUserId++,
    full_name:     data.full_name || username,
    username:      username,
    email:         email,
    password_hash: data.password_hash,
    role:          data.role || 'player',
    gender:        data.gender || 'male',
    phone:         data.phone || '',
    skill_level:   data.skill_level || '',
    city:          data.city || '',
    avatar_color:  data.avatar_color || '#00F5C4',
    is_active:     true,
    created_at:    new Date().toISOString(),
  };
  mockDB.users.push(user);
  return user;
}

// =============================================
// MATCH CRUD (Mock)
// =============================================
function getMatchesWithCount(filters = {}) {
  if (!useMock) return null;
  let results = mockDB.matches.filter(m => m.status !== 'cancelled');
  if (filters.city) results = results.filter(m => m.city === filters.city);
  if (filters.district) results = results.filter(m => m.district === filters.district);
  if (filters.skill_level && filters.skill_level !== 'Tất cả trình độ') {
    results = results.filter(m => m.skill_level.includes(filters.skill_level) || m.skill_level === 'Tất cả trình độ');
  }
  if (filters.gender_required && filters.gender_required !== 'mixed') {
    results = results.filter(m => !m.gender_required || m.gender_required === filters.gender_required || m.gender_required === 'mixed');
  }
  return results.map(m => {
    const pList     = mockDB.participants.filter(p => p.match_id === m.id && p.status !== 'cancelled');
    const confirmed = pList.filter(p => p.status === 'confirmed').length;
    const waitlist  = pList.filter(p => p.status === 'waitlist').length;
    return { ...m, confirmed_count: confirmed, waitlist_count: waitlist };
  });
}

function getMatchById(id) {
  if (!useMock) return null;
  return mockDB.matches.find(m => m.id === parseInt(id)) || null;
}

function getParticipantsByMatchId(matchId) {
  if (!useMock) return null;
  return mockDB.participants
    .filter(p => p.match_id === parseInt(matchId) && p.status !== 'cancelled')
    .sort((a, b) => a.queue_order - b.queue_order);
}

function addParticipant(matchId, data) {
  if (!useMock) return null;
  const match = getMatchById(matchId);
  if (!match) return { error: 'Match not found', status: 404 };
  const confirmed  = mockDB.participants.filter(p => p.match_id === parseInt(matchId) && p.status === 'confirmed').length;
  const allActive  = mockDB.participants.filter(p => p.match_id === parseInt(matchId) && p.status !== 'cancelled');
  const isWaitlist = confirmed >= match.max_slots;
  const queueOrder = allActive.length + 1;
  const participant = {
    id:             mockDB.nextParticipantId++,
    match_id:       parseInt(matchId),
    player_name:    data.player_name,
    player_phone:   data.player_phone,
    skill_level:    data.skill_level || match.skill_level,
    status:         isWaitlist ? 'waitlist' : 'confirmed',
    deposit_status: 'pending',
    queue_order:    queueOrder,
    note:           data.note || '',
    registered_at:  new Date().toISOString(),
  };
  mockDB.participants.push(participant);
  return participant;
}

function cancelParticipant(participantId) {
  if (!useMock) return null;
  const p = mockDB.participants.find(p => p.id === parseInt(participantId));
  if (!p) return { error: 'Participant not found', status: 404 };
  const wasConfirmed = p.status === 'confirmed';
  p.status     = 'cancelled';
  p.updated_at = new Date().toISOString();
  if (wasConfirmed) {
    const match   = getMatchById(p.match_id);
    const confirmed = mockDB.participants.filter(pp => pp.match_id === p.match_id && pp.status === 'confirmed').length;
    if (confirmed < match.max_slots) {
      const top = mockDB.participants
        .filter(pp => pp.match_id === p.match_id && pp.status === 'waitlist')
        .sort((a, b) => a.queue_order - b.queue_order)[0];
      if (top) {
        top.status     = 'confirmed';
        top.updated_at = new Date().toISOString();
        return { cancelled: p, promoted: top };
      }
    }
  }
  return { cancelled: p, promoted: null };
}

function updateDepositStatus(participantId, status) {
  if (!useMock) return null;
  const p = mockDB.participants.find(p => p.id === parseInt(participantId));
  if (!p) return { error: 'Participant not found', status: 404 };
  p.deposit_status = status;
  p.updated_at     = new Date().toISOString();
  return p;
}

function addMatch(data) {
  if (!useMock) return null;
  const match = {
    id: mockDB.nextMatchId++,
    ...data,
    status:     'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockDB.matches.push(match);
  return match;
}

function getCourts() {
  if (!useMock) return null;
  return mockDB.courts;
}

export {
  pool,
  useMock,
  findUserByEmail,
  findUserById,
  createUser,
  getMatchesWithCount,
  getMatchById,
  getParticipantsByMatchId,
  addParticipant,
  cancelParticipant,
  updateDepositStatus,
  addMatch,
  getCourts,
};
