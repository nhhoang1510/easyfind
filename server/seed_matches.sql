-- Mock data: 10 matches for testing booking features
INSERT INTO matches (
  title, host_id, host_name, host_phone, court_id, court_name, district, city, 
  play_date, start_time, end_time, max_slots, cost_per_slot, shuttlecock, skill_level, gender_required, note, status
) VALUES
(
  'Giao lưu cuối tuần Ba Đình', 1, 'Test Host', '0988888888', 
  1, 'Sân Cầu Lông Viettel', 'Ba Đình', 'Hà Nội',
  '2026-08-02', '18:00', '20:00', 10, 50000, 'Ba Sao', 'Trung bình', 'mixed', 
  'Chơi vui là chính, có giao lưu nước ngọt giải khát.', 'open'
),
(
  'Kèo tối thứ 3 Đống Đa', 2, 'Phạm Minh Ngọc', '0912345678', 
  2, 'Sân Cầu Lông Khâm Thiên', 'Đống Đa', 'Hà Nội',
  '2026-08-05', '19:00', '21:00', 8, 60000, 'Yonex Aerosensa', 'Trung bình khá', 'male', 
  'Chơi nghiêm túc, yêu cầu trình trung bình khá trở lên để giao lưu nhiệt tình.', 'open'
),
(
  'Đánh sáng Cầu Giấy', 1, 'Test Host', '0988888888', 
  3, 'Sân Cầu Lông Cầu Giấy Sport', 'Cầu Giấy', 'Hà Nội',
  '2026-08-03', '06:00', '08:00', 12, 40000, 'Ba Sao', 'Mới chơi', 'mixed', 
  'Dành cho các bạn mới chơi, có hướng dẫn di chuyển cơ bản.', 'open'
),
(
  'Kèo nữ Cầu Giấy Sport', 2, 'Phạm Minh Ngọc', '0912345678', 
  3, 'Sân Cầu Lông Cầu Giấy Sport', 'Cầu Giấy', 'Hà Nội',
  '2026-08-04', '17:00', '19:00', 8, 55000, 'Ba Sao', 'Yếu', 'female', 
  'Kèo dành riêng cho các bạn nữ giao lưu vui vẻ nhẹ nhàng.', 'open'
),
(
  'Giao lưu tối Long Biên', 1, 'Test Host', '0988888888', 
  4, 'Sân Cầu Lông Long Biên Arena', 'Long Biên', 'Hà Nội',
  '2026-08-06', '19:30', '21:30', 14, 45000, 'Victor NS', 'Trung bình yếu', 'mixed', 
  'Sân rộng 4 court, chơi xoay vòng liên tục không lo chờ lâu.', 'open'
),
(
  'Kèo khá Ba Đình 20h', 2, 'Phạm Minh Ngọc', '0912345678', 
  1, 'Sân Cầu Lông Viettel', 'Ba Đình', 'Hà Nội',
  '2026-08-07', '20:00', '22:00', 8, 75000, 'Yonex Aerosensa', 'Khá', 'male', 
  'Trình khá trở lên, đập cầu sung sức, đánh đôi xoay vòng.', 'open'
),
(
  'Sáng chủ nhật Khâm Thiên', 1, 'Test Host', '0988888888', 
  2, 'Sân Cầu Lông Khâm Thiên', 'Đống Đa', 'Hà Nội',
  '2026-08-03', '07:00', '09:00', 10, 50000, 'Ba Sao', 'Trung bình', 'mixed', 
  'Buổi sáng mát mẻ, thảm đẹp, ánh sáng chuẩn.', 'open'
),
(
  'Kèo chiều thứ 7 Cầu Giấy', 2, 'Phạm Minh Ngọc', '0912345678', 
  3, 'Sân Cầu Lông Cầu Giấy Sport', 'Cầu Giấy', 'Hà Nội',
  '2026-08-02', '15:00', '17:00', 12, 55000, 'Victor NS', 'Trung bình khá', 'mixed', 
  'Đánh đôi nam nữ xoay vòng nhiệt情.', 'open'
),
(
  'Tập luyện tối Long Biên', 1, 'Test Host', '0988888888', 
  4, 'Sân Cầu Lông Long Biên Arena', 'Long Biên', 'Hà Nội',
  '2026-08-04', '18:30', '20:30', 10, 40000, 'Ba Sao', 'Yếu', 'mixed', 
  'Tập từ cơ bản, nâng cao thể lực.', 'open'
),
(
  'Kèo đỉnh cao cuối tuần', 2, 'Phạm Minh Ngọc', '0912345678', 
  1, 'Sân Cầu Lông Viettel', 'Ba Đình', 'Hà Nội',
  '2026-08-03', '20:00', '22:00', 6, 80000, 'Yonex Aerosensa', 'Khá', 'male', 
  'Chỉ nhận trình khá, cầu Yonex chuẩn thi đấu.', 'open'
);
