-- =============================================
-- EasyFind - Badminton MatchHub Database Schema
-- Separate Tables for Users (Players) and Hosts
-- PostgreSQL 14+
-- =============================================

DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS hosts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- TABLE 1: users (Tài khoản Người Chơi - Player)
-- =============================================
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gender        VARCHAR(20) NOT NULL DEFAULT 'other',  -- 'male' | 'female' | 'other'
  skill_level   VARCHAR(50),  -- 'Mới chơi' | 'Yếu' | 'Trung bình yếu' | 'Trung bình' | 'Trung bình khá' | 'Khá'
  city          VARCHAR(100) DEFAULT 'Hà Nội',
  avatar_color  VARCHAR(30) DEFAULT '#00F5C4',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

-- =============================================
-- TABLE 2: hosts (Tài khoản Người Tổ Chức - Host)
-- =============================================
CREATE TABLE hosts (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gender        VARCHAR(20) NOT NULL DEFAULT 'other',
  phone         VARCHAR(20),
  bank_name     VARCHAR(100),
  bank_account  VARCHAR(50),
  bank_owner    VARCHAR(100),
  city          VARCHAR(100) DEFAULT 'Hà Nội',
  avatar_color  VARCHAR(30) DEFAULT '#AAFF00',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hosts_username ON hosts(username);

-- =============================================
-- TABLE 3: courts (Danh mục Sân Cầu Lông)
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
-- TABLE 4: matches (Thông tin Kèo Đấu do Host tạo)
-- =============================================
CREATE TABLE matches (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(300) NOT NULL,
  host_id         INTEGER REFERENCES hosts(id) ON DELETE SET NULL,
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

-- DANH MỤC SÂN BAN ĐẦU
INSERT INTO courts (name, address, district, city) VALUES
  ('Sân Cầu Lông Viettel', '1 Giang Văn Minh, Kim Mã', 'Ba Đình', 'Hà Nội'),
  ('Sân Cầu Lông Khâm Thiên', '12 Khâm Thiên', 'Đống Đa', 'Hà Nội'),
  ('Sân Cầu Lông Cầu Giấy Sport', '36 Trần Thái Tông', 'Cầu Giấy', 'Hà Nội'),
  ('Sân Cầu Lông Long Biên Arena', '5 Đức Giang', 'Long Biên', 'Hà Nội'),
  ('Sân Kỳ Hòa', '1 Huyền Trân Công Chúa, Quận 1', 'Quận 1', 'TP.HCM'),
  ('Sân Cầu Lông Celadon City', '36 Đặng Văn Bi, Thủ Đức', 'Thủ Đức', 'TP.HCM'),
  ('Sân Cầu Lông Hoàng Long', '45 Lê Văn Lương, Hải Châu', 'Hải Châu', 'Đà Nẵng');
