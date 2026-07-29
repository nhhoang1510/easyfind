-- =============================================
-- KèoCầuPro - Badminton MatchHub Database Schema
-- PostgreSQL 14+
-- =============================================

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS courts CASCADE;

-- =============================================
-- TABLE: courts (Thông tin Sân Cầu Lông)
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
-- TABLE: matches (Thông tin Kèo Đánh)
-- =============================================
CREATE TABLE matches (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(300) NOT NULL,
  host_name       VARCHAR(100) NOT NULL,
  host_phone      VARCHAR(20),
  court_id        INTEGER REFERENCES courts(id) ON DELETE SET NULL,
  court_name      VARCHAR(200),   -- cache court name for performance
  district        VARCHAR(100),   -- cache district for filtering
  city            VARCHAR(100) DEFAULT 'Hà Nội',
  play_date       DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  max_slots       INTEGER NOT NULL DEFAULT 10,
  cost_per_slot   NUMERIC(12,0) DEFAULT 0,
  shuttlecock     VARCHAR(100) DEFAULT 'Ba Sao',
  skill_level     VARCHAR(50) DEFAULT 'Trung bình',  -- Mới chơi | Trung bình | Khá/Tốt | Tất cả trình độ
  note            TEXT,
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(50),
  bank_owner      VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'open',  -- open | closed | cancelled
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_play_date ON matches(play_date);
CREATE INDEX idx_matches_city_district ON matches(city, district);
CREATE INDEX idx_matches_skill_level ON matches(skill_level);
CREATE INDEX idx_matches_status ON matches(status);

-- =============================================
-- TABLE: participants (Danh sách Người Tham Gia)
-- =============================================
CREATE TABLE participants (
  id              SERIAL PRIMARY KEY,
  match_id        INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_name     VARCHAR(100) NOT NULL,
  player_phone    VARCHAR(20),
  skill_level     VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'confirmed', -- confirmed | waitlist | cancelled
  deposit_status  VARCHAR(20) DEFAULT 'pending',   -- pending | paid | waived
  queue_order     INTEGER NOT NULL,                -- Thứ tự đăng ký (tự tính)
  note            TEXT,
  registered_at   TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_participants_match_id ON participants(match_id);
CREATE INDEX idx_participants_match_status ON participants(match_id, status);
CREATE INDEX idx_participants_queue ON participants(match_id, queue_order);

-- =============================================
-- FUNCTION: auto promote waitlist on cancel
-- Khi 1 người hủy slot confirmed -> tự đôn top 1 waitlist lên confirmed
-- =============================================
CREATE OR REPLACE FUNCTION auto_promote_waitlist()
RETURNS TRIGGER AS $$
DECLARE
  confirmed_count INTEGER;
  max_slots_val   INTEGER;
  top_waitlist    participants%ROWTYPE;
BEGIN
  -- Chỉ xử lý khi status chuyển sang 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Đếm số người đang confirmed
    SELECT COUNT(*), m.max_slots
    INTO confirmed_count, max_slots_val
    FROM participants p
    JOIN matches m ON m.id = p.match_id
    WHERE p.match_id = NEW.match_id AND p.status = 'confirmed'
    GROUP BY m.max_slots;

    -- Nếu còn chỗ, đôn người waitlist đầu tiên lên
    IF confirmed_count < max_slots_val THEN
      SELECT * INTO top_waitlist
      FROM participants
      WHERE match_id = NEW.match_id AND status = 'waitlist'
      ORDER BY queue_order ASC
      LIMIT 1;

      IF FOUND THEN
        UPDATE participants
        SET status = 'confirmed', updated_at = NOW()
        WHERE id = top_waitlist.id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_promote_waitlist
AFTER UPDATE ON participants
FOR EACH ROW
EXECUTE FUNCTION auto_promote_waitlist();

-- =============================================
-- SEED DATA: Courts (Sân Cầu Lông Mẫu)
-- =============================================
INSERT INTO courts (name, address, district, city) VALUES
  ('Sân Cầu Lông Viettel', '1 Giang Văn Minh, Kim Mã', 'Ba Đình', 'Hà Nội'),
  ('Sân Cầu Lông Khâm Thiên', '12 Khâm Thiên', 'Đống Đa', 'Hà Nội'),
  ('Sân Cầu Lông Cầu Giấy Sport', '36 Trần Thái Tông', 'Cầu Giấy', 'Hà Nội'),
  ('Sân Cầu Lông Long Biên Arena', '5 Đức Giang', 'Long Biên', 'Hà Nội'),
  ('Sân Kỳ Hòa', '1 Huyền Trân Công Chúa, Quận 1', 'Quận 1', 'TP.HCM'),
  ('Sân Cầu Lông Celadon City', '36 Đặng Văn Bi, Thủ Đức', 'Thủ Đức', 'TP.HCM'),
  ('Sân Cầu Lông Hoàng Long', '45 Lê Văn Lương, Hải Châu', 'Hải Châu', 'Đà Nẵng'),
  ('Sân Cầu Lông Olympic', '55 Trần Phú', 'Hải Châu', 'Đà Nẵng');

-- =============================================
-- SEED DATA: Matches (Kèo Mẫu Thực Tế)
-- =============================================
INSERT INTO matches (title, host_name, host_phone, court_id, court_name, district, city, play_date, start_time, end_time, max_slots, cost_per_slot, shuttlecock, skill_level, note, bank_name, bank_account, bank_owner, status) VALUES
  (
    'Kèo Sáng Sớm Ba Đình - Trung Bình',
    'Minh Host', '0912345678', 1, 'Sân Cầu Lông Viettel', 'Ba Đình', 'Hà Nội',
    CURRENT_DATE + 1, '06:00', '08:00', 8, 60000,
    'Ba Sao', 'Trung bình',
    'Đánh nhẹ nhàng, thân thiện. Cọc 50k qua chuyển khoản. Mặc trang phục thể thao.',
    'VCB', '1234567890', 'NGUYEN VAN MINH', 'open'
  ),
  (
    'Kèo Chiều Đống Đa - Khá/Tốt - Cần Thêm 3 Người!',
    'Long Pro', '0987654321', 2, 'Sân Cầu Lông Khâm Thiên', 'Đống Đa', 'Hà Nội',
    CURRENT_DATE + 1, '17:00', '19:00', 6, 80000,
    'Hải Yến', 'Khá/Tốt',
    'Kèo dành cho người đã có nền tảng, đánh được tay đôi và tay đôi phối hợp. Cọc 60k.',
    'MB Bank', '9876543210', 'TRAN VAN LONG', 'open'
  ),
  (
    'Kèo Tối Thứ 7 Cầu Giấy - Tất cả Trình Độ',
    'Anh Hùng', '0901112233', 3, 'Sân Cầu Lông Cầu Giấy Sport', 'Cầu Giấy', 'Hà Nội',
    CURRENT_DATE + 2, '19:30', '21:30', 10, 70000,
    'Thành Công', 'Tất cả trình độ',
    'Kèo mở cho mọi trình độ, anh em vui vẻ là chính. Có thể mang cầu riêng. Cọc 50k.',
    'Techcombank', '5544332211', 'LE HUNG', 'open'
  ),
  (
    'Kèo Cuối Tuần Long Biên - Chỉ Nam - Trung Bình',
    'Tuấn Long Biên', '0933221144', 4, 'Sân Cầu Lông Long Biên Arena', 'Long Biên', 'Hà Nội',
    CURRENT_DATE + 3, '07:00', '09:00', 8, 55000,
    'Ba Sao', 'Trung bình',
    'Kèo nam. Đánh theo cặp, xoay vòng vui vẻ. Mang nước uống cá nhân. Cọc 40k.',
    'ACB', '6677889900', 'NGUYEN VAN TUAN', 'open'
  ),
  (
    'Kèo TP.HCM - Kỳ Hòa Quận 1 - Sáng Chủ Nhật',
    'Nam Sài Gòn', '0977665544', 5, 'Sân Kỳ Hòa', 'Quận 1', 'TP.HCM',
    CURRENT_DATE + 2, '08:00', '10:30', 12, 90000,
    'Hải Yến', 'Khá/Tốt',
    'Sân xịn Quận 1, đánh nghiêm túc. Cọc 70k, thanh toán trước 24h.',
    'VCB', '1122334455', 'TRAN NAM', 'open'
  ),
  (
    'Kèo HCM - Celadon Thủ Đức - Chiều Thứ 6',
    'Hưng Thủ Đức', '0944556677', 6, 'Sân Cầu Lông Celadon City', 'Thủ Đức', 'TP.HCM',
    CURRENT_DATE + 1, '16:00', '18:00', 8, 65000,
    'Ba Sao', 'Mới chơi',
    'Kèo vui vẻ, không áp lực. Dành cho người mới học hoặc chơi được 1-2 năm.',
    'MB Bank', '3344556677', 'NGUYEN HUNG', 'open'
  ),
  (
    'Kèo Đà Nẵng - Hải Châu - Tối Thứ 4',
    'Phong Đà Nẵng', '0922334455', 7, 'Sân Cầu Lông Hoàng Long', 'Hải Châu', 'Đà Nẵng',
    CURRENT_DATE + 1, '19:00', '21:00', 8, 60000,
    'Ba Sao', 'Trung bình',
    'Kèo thường xuyên mỗi thứ 4, anh em quen biết nhau rồi, chào đón người mới!',
    'VietinBank', '8899001122', 'LE VAN PHONG', 'open'
  ),
  (
    'Kèo Hà Nội - Ba Đình Tối Thứ 3 - ĐÃ ĐỦ NGƯỜI (Còn Dự Bị)',
    'Dũng Ba Đình', '0955443322', 1, 'Sân Cầu Lông Viettel', 'Ba Đình', 'Hà Nội',
    CURRENT_DATE + 1, '20:00', '22:00', 6, 75000,
    'Hải Yến', 'Khá/Tốt',
    'Kèo đã đủ người chính thức. Vẫn có thể đăng ký dự bị (sẽ được liên hệ nếu có người bùng).',
    'VCB', '7788990011', 'PHAM VAN DUNG', 'open'
  );

-- =============================================
-- SEED DATA: Participants (Người Chơi Mẫu)
-- =============================================
-- Kèo 1: Còn 3 slot
INSERT INTO participants (match_id, player_name, player_phone, skill_level, status, deposit_status, queue_order) VALUES
  (1, 'Nguyễn Văn An', '0911111111', 'Trung bình', 'confirmed', 'paid', 1),
  (1, 'Trần Thị Bình', '0922222222', 'Trung bình', 'confirmed', 'paid', 2),
  (1, 'Lê Văn Cường', '0933333333', 'Trung bình', 'confirmed', 'pending', 3),
  (1, 'Phạm Thị Dung', '0944444444', 'Mới chơi', 'confirmed', 'paid', 4),
  (1, 'Hoàng Văn Em', '0955555555', 'Trung bình', 'confirmed', 'pending', 5);

-- Kèo 2: Còn 2 slot
INSERT INTO participants (match_id, player_name, player_phone, skill_level, status, deposit_status, queue_order) VALUES
  (2, 'Vũ Thị Phương', '0966666666', 'Khá/Tốt', 'confirmed', 'paid', 1),
  (2, 'Đặng Văn Quang', '0977777777', 'Khá/Tốt', 'confirmed', 'paid', 2),
  (2, 'Bùi Thị Hoa', '0988888888', 'Khá/Tốt', 'confirmed', 'paid', 3),
  (2, 'Đỗ Văn Hùng', '0999999999', 'Khá/Tốt', 'confirmed', 'pending', 4);

-- Kèo 8: Đã đủ người chính thức + 2 dự bị
INSERT INTO participants (match_id, player_name, player_phone, skill_level, status, deposit_status, queue_order) VALUES
  (8, 'Nguyễn Minh Tuấn', '0911221133', 'Khá/Tốt', 'confirmed', 'paid', 1),
  (8, 'Lê Thành Nam', '0922332244', 'Khá/Tốt', 'confirmed', 'paid', 2),
  (8, 'Trần Đức Anh', '0933443355', 'Khá/Tốt', 'confirmed', 'paid', 3),
  (8, 'Phạm Văn Hải', '0944554466', 'Khá/Tốt', 'confirmed', 'paid', 4),
  (8, 'Hoàng Trung Kiên', '0955665577', 'Khá/Tốt', 'confirmed', 'paid', 5),
  (8, 'Vũ Quốc Bảo', '0966776688', 'Khá/Tốt', 'confirmed', 'pending', 6),
  -- 2 người dự bị
  (8, 'Đỗ Huy Hoàng', '0977887799', 'Khá/Tốt', 'waitlist', 'pending', 7),
  (8, 'Bùi Thanh Long', '0988998800', 'Trung bình', 'waitlist', 'pending', 8);
