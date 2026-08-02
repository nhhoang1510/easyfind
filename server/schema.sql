-- =============================================
-- EasyFind - Badminton MatchHub Database Schema
-- Separate Tables for Users (Players) and Hosts
-- PostgreSQL 14+
-- =============================================

DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- TABLE 1: users (Tài khoản Người Dùng Unified User Account)
-- =============================================
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  full_name         VARCHAR(100) NOT NULL,
  username          VARCHAR(100) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  gender            VARCHAR(20) NOT NULL DEFAULT 'other',  -- 'male' | 'female' | 'other'
  skill_level       VARCHAR(50),  -- 'Mới chơi' | 'Yếu' | 'Trung bình yếu' | 'Trung bình' | 'Trung bình khá' | 'Khá'
  phone             VARCHAR(20),
  is_phone_verified BOOLEAN DEFAULT false,
  city              VARCHAR(100) DEFAULT 'Hà Nội',
  avatar_color      VARCHAR(30) DEFAULT '#00F5C4',
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

-- =============================================
-- TABLE 2: courts (Danh mục Sân Cầu Lông)
-- =============================================
CREATE TABLE courts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  address     TEXT,
  district    VARCHAR(100),
  city        VARCHAR(100) DEFAULT 'Hà Nội',
  phone       VARCHAR(20),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courts_city_district ON courts(city, district);

-- =============================================
-- TABLE 3: matches (Thông tin Kèo Đấu do Người dùng tạo)
-- =============================================
CREATE TABLE matches (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(300) NOT NULL,
  host_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  host_name       VARCHAR(100) NOT NULL,
  host_phone      VARCHAR(20),
  court_id        INTEGER REFERENCES courts(id) ON DELETE SET NULL,
  court_name      VARCHAR(200),
  district        VARCHAR(100),
  city            VARCHAR(100) DEFAULT 'Hà Nội',
  play_date       DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  max_slots       INTEGER NOT NULL DEFAULT 8,
  cost_per_slot   NUMERIC(12,0) DEFAULT 0,
  slot_categories JSONB DEFAULT '[]', -- Danh sách nhóm suất phân bổ chi tiết
  shuttlecock     VARCHAR(100) DEFAULT 'Ba Sao',
  skill_level     VARCHAR(50) DEFAULT 'Trung bình',
  gender_required VARCHAR(20), -- 'male' | 'female' | 'mixed' | null
  note            TEXT,
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(50),
  bank_owner      VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'open', -- 'open' | 'closed' | 'cancelled'
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_play_date ON matches(play_date);
CREATE INDEX idx_matches_city_district ON matches(city, district);
CREATE INDEX idx_matches_skill_level ON matches(skill_level);
CREATE INDEX idx_matches_gender_required ON matches(gender_required);
CREATE INDEX idx_matches_status ON matches(status);

-- =============================================
-- TABLE 5: participants (Danh sách Người Đăng Ký Slot)
-- =============================================
CREATE TABLE participants (
  id              SERIAL PRIMARY KEY,
  match_id        INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  player_name     VARCHAR(100) NOT NULL,
  player_phone    VARCHAR(20),
  skill_level     VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed' | 'waitlist' | 'cancelled'
  deposit_status  VARCHAR(20) DEFAULT 'pending',   -- 'pending' | 'paid' | 'waived'
  queue_order     INTEGER NOT NULL,
  note            TEXT,
  registered_at   TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_participants_match_id ON participants(match_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);

-- Thêm cột google_maps_url nếu chưa có
ALTER TABLE courts ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- DANH MỤC SÂN BAN ĐẦU
INSERT INTO courts (name, address, district, city, google_maps_url) VALUES
  ('Sân cầu lông Đức Thảo', '18 Tam Trinh, Tương Mai, Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'https://maps.app.goo.gl/JyDGXTP6H59iKgS89'),
  ('Trung Tâm TDTT Sân câu lông', '521 Phố Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'https://maps.app.goo.gl/m3DisHu6jU776tiL7'),
  ('Net Sport Center', '18 Đường Tam Trinh, Tương Mai, Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'https://maps.app.goo.gl/yKXKq8TNrHdk4Pkq7'),
  ('NTĐ Bách Khoa', '02 Lê Thanh Nghị, Bách Khoa, Hai Bà Trưng, Hà Nội', 'Hai Bà Trưng', 'Hà Nội', 'https://maps.app.goo.gl/zLNHkAFCxqkrTefH8'),
  ('Sân Cầu Lông Tiến Dinh Sport', 'Ngách 1, Ngõ 147A Tân Mai, Hoàng Mai, Hà Nội', 'Hoàng Mai', 'Hà Nội', 'https://maps.app.goo.gl/Yw828MjQxJzj24vi6'),
  ('Sân cầu lông Nhà thi đấu Đền Lừ', 'Khu vực Hồ Đền Lừ 3, Phường Hoàng Văn Thụ, Hoàng Mai, Hà Nội', 'Hoàng Mai', 'Hà Nội', 'https://maps.app.goo.gl/gyA95PAryFao5dWv7'),
  ('Sân Cầu Lông Phương Linh', '151 P. Yên Duyên, Phường Yên Sở, Hoàng Mai, Hà Nội', 'Hoàng Mai', 'Hà Nội', 'https://maps.app.goo.gl/9KMZnCowpA2ZzTPw7'),
  ('Nhà thi đấu Hoàng Mai', 'Phường Định Công, Hoàng Mai, Hà Nội', 'Hoàng Mai', 'Hà Nội', 'https://maps.app.goo.gl/XXFumxDGKtTLpiaUA'),
  ('CLB Cầu Lông Hải Lâm', 'Phường Vĩnh Hưng, Hoàng Mai, Hà Nội', 'Hoàng Mai', 'Hà Nội', 'https://maps.app.goo.gl/oL25TmiDUcwoy2u5A'),
  ('Sân Cầu Lông Quốc Việt', 'Hoàng Mai, Hà Nội', 'Hoàng Mai', 'Hà Nội', 'https://maps.app.goo.gl/pB3jHR6QLHPwwbsa7'),
  ('Sân Cầu Lông Nhà thi đấu Cầu Giấy', 'Số 35 Trần Quý Kiên, Dịch Vọng, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Nhà+Thi+Đấu+Cầu+Giấy+35+Trần+Quý+Kiên'),
  ('Sân cầu lông Trường THPT Yên Hòa', 'Ngõ 251 Nguyễn Khang, Yên Hòa, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+THPT+Yên+Hòa+251+Nguyễn+Khang'),
  ('Sân cầu lông Phan Văn Trường', 'Ngõ 77 Phan Văn Trường, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Phan+Văn+Trường+Ngõ+77'),
  ('Sân cầu lông Trường Tiểu học Yên Hòa', 'Số 108 Hạ Yên Quyết, Yên Hòa, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Tiểu+Học+Yên+Hòa+108+Hạ+Yên+Quyết'),
  ('Sân cầu lông Trường Đại học Giao thông vận tải', 'Số 3 Cầu Giấy, Láng Thượng, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Giao+Thông+Vận+Tải'),
  ('Sân cầu lông Trần Duy Hưng', 'Số 180 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+180+Trần+Duy+Hưng'),
  ('Sân cầu lông Đại học Sư phạm', 'Số 136 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Sư+Phạm+136+Xuân+Thủy'),
  ('Sân cầu lông Trường THCS Nghĩa Tân', 'Số 14 Tô Hiệu, Dịch Vọng, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+THCS+Nghĩa+Tân+14+Tô+Hiệu'),
  ('Sân cầu lông Mai Dịch', 'Trần Tử Bình, Mai Dịch, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Mai+Dịch+Trần+Tử+Bình'),
  ('Sân cầu lông Học viện chính trị quốc gia Hồ Chí Minh', 'Ngõ 134 Nguyễn Phong Sắc, Dịch Vọng, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Học+Viện+Chính+Trị+Nguyễn+Phong+Sắc'),
  ('Sân cầu lông Trường THPT Lý Thái Tổ', 'Số 165 Hoàng Ngân, Trung Hòa, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+THPT+Lý+Thái+Tổ+165+Hoàng+Ngân'),
  ('Sân cầu lông Nguyễn Văn Huyên', 'Số 85 Nguyễn Văn Huyên, Quan Hoa, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+85+Nguyễn+Văn+Huyên'),
  ('Sân cầu lông Minh Toàn', 'Đường Hạ Yên Quyết, Yên Hòa, Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Minh+Toàn+Yên+Hòa'),
  ('Sân cầu lông Khuất Duy Tiến Center', 'Số 166 Khuất Duy Tiến, Nhân Chính, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Khuất+Duy+Tiến+166'),
  ('Sân cầu lông Đại học Hà Nội', 'Số 264 Nguyễn Trãi, Trung Văn, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Hà+Nội+264+Nguyễn+Trãi'),
  ('Sân cầu lông Khương Đình', 'Ngõ 460 Khương Đình, Hạ Đình, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Khương+Đình+Ngõ+460'),
  ('Sân cầu lông Quan Nhân', 'Ngõ 144 Quan Nhân, Nhân Chính, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Quan+Nhân+Ngõ+144'),
  ('Sân cầu lông Vũ Hữu', 'Ngõ 12 Vũ Hữu, Thanh Xuân Bắc, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Vũ+Hữu+Ngõ+12'),
  ('Sân cầu lông Lê Văn Lương', 'Số 88 Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Lê+Văn+Lương+88'),
  ('Sân cầu lông Nguyễn Tuân', 'Số 90 Nguyễn Tuân, Thanh Xuân Trung, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Nguyễn+Tuân+90'),
  ('Sân cầu lông Kim Giang', 'Số 320 Kim Giang, Đại Kim, Thanh Xuân, Hà Nội', 'Thanh Xuân', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Kim+Giang+320'),
  ('Sân cầu lông Việt Hưng', 'KĐT Việt Hưng, Giang Biên, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Việt+Hưng+Long+Biên'),
  ('Sân cầu lông Long Biên Arena', 'Số 5 Đức Giang, Đức Giang, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Long+Biên+Arena+5+Đức+Giang'),
  ('Sân cầu lông Bồ Đề', 'Ngõ 264 Bồ Đề, Bồ Đề, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Bồ+Đề+Ngõ+264'),
  ('Sân cầu lông Ngọc Lâm', 'Ngõ 154 Ngọc Lâm, Ngọc Lâm, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Ngọc+Lâm+Ngõ+154'),
  ('Sân cầu lông Thạch Bàn', 'Phố Thạch Bàn, Thạch Bàn, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Thạch+Bàn+Long+Biên'),
  ('Sân cầu lông Phúc Lợi', 'Phố Phúc Lợi, Phúc Lợi, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Phúc+Lợi+Long+Biên'),
  ('Sân cầu lông Sài Đồng', 'KĐT Sài Đồng, Sài Đồng, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Sài+Đồng+Long+Biên'),
  ('Sân cầu lông Gia Thụy', 'Ngõ 564 Nguyễn Văn Cừ, Gia Thụy, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Gia+Thụy+564+Nguyễn+Văn+Cừ'),
  ('Sân cầu lông Thượng Thanh', 'Ngõ 99 Lý Sơn, Thượng Thanh, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Thượng+Thanh+Lý+Sơn'),
  ('Sân cầu lông Cự Khối', 'Đường Đập Cự Khối, Cự Khối, Long Biên, Hà Nội', 'Long Biên', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Cự+Khối+Long+Biên'),
  ('Sân Cầu Lông La Khê', 'Làng La Khê, đường Lê Trọng Tấn, Phường La Khê, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/FVRvCAy8K3UkovHK7'),
  ('Trung Tâm Thể Thao Duy Hưng Cơ Sở Hà Đông', 'Khu Dịch Vụ Dọc Bún 1, Phường La Khê, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/hCK2cBKLYCC2aWmr8'),
  ('Sân Cầu Lông Thắng Lĩnh Badminton', '948 Đ. Quang Trung, Ba La, Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/1bKWAjdQ3oNB8SzL7'),
  ('Sân Cầu Lông Nhà Thi Đấu Hà Đông', 'Số 182 Đường Quang Trung, Phường Quang Trung, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/hTAcTr2Hafv8Vz39A'),
  ('Sân Cầu Lông Tổ 9 Đồng Mai', 'Tổ 9, Phường Đồng Mai, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/Ske6XSj5BkXWWjf76'),
  ('Sân Cầu Lông Trường THPT Lê Lợi', 'Số 72 Bà Triệu, Phường Hà Cầu, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/pfWbVVftZMyYsAJJ8'),
  ('Sân Cầu Lông Trường THCS Lê Quý Đôn', 'Khu đô thị An Hưng, Phường Dương Nội, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/JJ39C2k9wQLBNmg86'),
  ('Sân Cầu Lông Trường Chuyên Nguyễn Huệ', 'Đường Tố Hữu, Phường La Khê, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/L4mBKN89ALotHFYG9'),
  ('Sân Cầu Lông Cây Đề', 'Số 75 Văn Nội, Phường Phú Lương, Quận Hà Đông, Hà Nội', 'Hà Đông', 'Hà Nội', 'https://maps.app.goo.gl/YM3QYZ27Qf8zYG1D6'),
  ('Sân cầu lông Đại học Ngoại Thương', 'Nhà thi đấu ĐH Ngoại Thương, 91 Chùa Láng, Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Ngoại+Thương+91+Chùa+Láng'),
  ('Sân cầu lông Đại học Công Đoàn (Victor)', '169 Tây Sơn, Quang Trung, Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Công+Đoàn+169+Tây+Sơn'),
  ('Sân cầu lông Ban Cơ yếu Chính phủ', '107 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Ban+Cơ+Yếu+Chính+Phủ+107+Nguyễn+Chí+Thanh'),
  ('Sân cầu lông Nhà thi đấu Đại học Thủy Lợi', '175 Tây Sơn, Trung Liệt, Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Đại+Học+Thủy+Lợi+175+Tây+Sơn'),
  ('Sân cầu lông Học viện Ngân hàng', 'Số 12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Học+Viện+Ngân+Hàng+12+Chùa+Bộc'),
  ('Sân cầu lông Fleet Hồ Đắc Di', 'Ngõ 141 Hồ Đắc Di, Nam Đồng, Đống Đa, Hà Nội', 'Đống Đa', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Fleet+141+Hồ+Đắc+Di'),
  ('Sân cầu lông BOP Phạm Hồng Thái', '01 Nguyễn Văn Ngọc, Cống Vị, Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Phạm+Hồng+Thái+01+Nguyễn+Văn+Ngọc'),
  ('Sân cầu lông Bệnh viện 354', '120 Phố Đốc Ngữ, Vĩnh Phúc, Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Bệnh+Viện+354+120+Đốc+Ngữ'),
  ('Sân cầu lông Quán Thánh', '115 Quán Thánh, Ba Đình, Hà Nội', 'Ba Đình', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+115+Quán+Thánh'),
  ('Sân cầu lông Nhà thi đấu Tây Hồ', '101 Đường Xuân La, Xuân La, Tây Hồ, Hà Nội', 'Tây Hồ', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Nhà+Thi+Đấu+Tây+Hồ+101+Xuân+La'),
  ('Sân cầu lông Số 6 Đặng Thai Mai', 'Số 6 Phố Đặng Thai Mai, Quảng An, Tây Hồ, Hà Nội', 'Tây Hồ', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+6+Đặng+Thai+Mai'),
  ('Sân cầu lông An Dương', 'Ngõ 76 An Dương, Yên Phụ, Tây Hồ, Hà Nội', 'Tây Hồ', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+An+Dương+Ngõ+76'),
  ('Sân cầu lông VNBC Phú Diễn', '158 Phú Diễn, Cầu Diễn, Nam Từ Liêm, Hà Nội', 'Nam Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+VNBC+158+Phú+Diễn'),
  ('Sân cầu lông Mỹ Đình', 'Đường Mỹ Đình, Mỹ Đình 2, Nam Từ Liêm, Hà Nội', 'Nam Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Mỹ+Đình'),
  ('Sân cầu lông Tây Mỗ', 'Đường Nhuệ Giang, Tây Mỗ, Nam Từ Liêm, Hà Nội', 'Nam Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Tây+Mỗ+Nhuệ+Giang'),
  ('Sân cầu lông Xuân Đỉnh', '176-178 Xuân Đỉnh, Phường Xuân Đỉnh, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Xuân+Đỉnh+176'),
  ('Sân cầu lông Trường Tiểu học Đức Thắng', 'Phường Đức Thắng, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Tiểu+Học+Đức+Thắng'),
  ('Sân cầu lông LD Badminton', 'Đường Trại Gà, Phường Đông Ngạc, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+LD+Badminton+Trại+Gà'),
  ('Sân cầu lông Học viện Tài chính', 'Số 58 Lê Văn Hiến, Phường Đức Thắng, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Học+Viện+Tài+Chính+58+Lê+Văn+Hiến'),
  ('Sân cầu lông CTA Badminton', 'Số 99 Ngõ 2 Đường Phan Bá Vành, Cầu Diễn, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+CTA+Badminton+Phan+Bá+Vành'),
  ('Sân cầu lông US Badminton', 'Đường CN3 Cụm công nghiệp Từ Liêm, Trịnh Văn Bô, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+US+Badminton+Trịnh+Văn+Bô'),
  ('Sân cầu lông Hoàng Huy (HH)', '451 Ngõ 68 Đường Phú Diễn, Phường Phú Diễn, Bắc Từ Liêm, Hà Nội', 'Bắc Từ Liêm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Hoàng+Huy+Phú+Diễn'),
  ('Sân cầu lông 3T', 'Số 96 Tựu Liệt, Thị trấn Văn Điển, Thanh Trì, Hà Nội', 'Thanh Trì', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+3T+96+Tựu+Liệt'),
  ('Sân cầu lông 1991 Club', '286 Nguyễn Xiển, Triều Khúc, Thanh Trì, Hà Nội', 'Thanh Trì', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+1991+Club+286+Nguyễn+Xiển'),
  ('Sân cầu lông Vina Badminton (Tổng Cục 5)', 'Đường số 1, Tổng cục 5, Tân Triều, Thanh Trì, Hà Nội', 'Thanh Trì', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Vina+Badminton+Tổng+Cục+5'),
  ('Sân cầu lông HG', 'Ngõ 512 Ngọc Hồi, Vĩnh Quỳnh, Thanh Trì, Hà Nội', 'Thanh Trì', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+HG+512+Ngọc+Hồi'),
  ('Sân cầu lông Sao Vàng', 'Đường Phạm Tu, Tân Triều, Thanh Trì, Hà Nội', 'Thanh Trì', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Sao+Vàng+Phạm+Tu'),
  ('Sân cầu lông Nhà thi đấu Gia Lâm', '437 Nguyễn Đức Thuận, Trâu Quỳ, Gia Lâm, Hà Nội', 'Gia Lâm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Nhà+Thi+Đấu+Gia+Lâm'),
  ('Sân cầu lông Cửu Việt', 'Khu Cửu Việt, Trâu Quỳ, Gia Lâm, Hà Nội', 'Gia Lâm', 'Hà Nội', 'https://maps.google.com/?q=Sân+Cầu+Lông+Cửu+Việt+Trâu+Quỳ');
