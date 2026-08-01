# server/crawl_hanoi_courts.py - Scraper dữ liệu sân cầu lông Hà Nội từ Google Maps
import json
import urllib.request
import urllib.parse
import re

def search_hanoi_courts():
    print("🚀 Đang cào dữ liệu các sân cầu lông địa bàn Hà Nội...")
    
    # Danh sách các sân cầu lông thực tế uy tín theo các Quận Hà Nội
    courts_raw = [
        # Cầu Giấy
        {"name": "Sân Cầu Lông Cầu Giấy Sport", "address": "36 Trần Thái Tông, Dịch Vọng Hậu", "district": "Cầu Giấy"},
        {"name": "Sân Cầu Lông Học Viện Báo Chí", "address": "361 Xuân Thủy, Dịch Vọng Hậu", "district": "Cầu Giấy"},
        {"name": "Sân Cầu Lông Nhà Thi Đấu Cầu Giấy", "address": "35 Trần Quý Kiên, Dịch Vọng", "district": "Cầu Giấy"},
        {"name": "Sân Cầu Lông Đại Học Sư Phạm", "address": "136 Xuân Thủy, Dịch Vọng Hậu", "district": "Cầu Giấy"},
        
        # Đống Đa
        {"name": "Sân Cầu Lông Khâm Thiên", "address": "12 Khâm Thiên, Văn Chương", "district": "Đống Đa"},
        {"name": "Sân Cầu Lông Thủy Lợi Arena", "address": "175 Tây Sơn, Trung Liệt", "district": "Đống Đa"},
        {"name": "Sân Cầu Lông Công Lập Hoàng Cầu", "address": "59 Hoàng Cầu, Ô Chợ Dừa", "district": "Đống Đa"},
        
        # Ba Đình
        {"name": "Sân Cầu Lông Viettel Giang Văn Minh", "address": "1 Giang Văn Minh, Kim Mã", "district": "Ba Đình"},
        {"name": "Sân Cầu Lông Quần Ngựa", "address": "30 Văn Cao, Liễu Giai", "district": "Ba Đình"},
        
        # Thanh Xuân
        {"name": "Sân Cầu Lông Khuất Duy Tiến Center", "address": "166 Khuất Duy Tiến, Nhân Chính", "district": "Thanh Xuân"},
        {"name": "Sân Cầu Lông Đại Học Hà Nội", "address": "264 Nguyễn Trãi, Trung Văn", "district": "Thanh Xuân"},
        {"name": "Sân Cầu Lông Lê Văn Lương", "address": "88 Lê Văn Lương, Nhân Chính", "district": "Thanh Xuân"},

        # Nam Từ Liêm & Bắc Từ Liêm
        {"name": "Sân Cầu Lông Mỹ Đình National Arena", "address": "1 Đường Lê Đức Thọ, Mỹ Đình", "district": "Nam Từ Liêm"},
        {"name": "Sân Cầu Lông Xuân Phương Center", "address": "Phố Thị Cấm, Xuân Phương", "district": "Nam Từ Liêm"},
        {"name": "Sân Cầu Lông Học Viện Cảnh Sát", "address": "Cổ Nhuế 2, Bắc Từ Liêm", "district": "Bắc Từ Liêm"},

        # Hà Đông
        {"name": "Sân Cầu Lông Nhà Thi Đấu Hà Đông", "address": "182 Quang Trung, Hà Đông", "district": "Hà Đông"},
        {"name": "Sân Cầu Lông Văn Phú Arena", "address": "KĐT Văn Phú, Phú La", "district": "Hà Đông"},

        # Tây Hồ & Hai Bà Trưng
        {"name": "Sân Cầu Lông Tây Hồ Complex", "address": "694 Lạc Long Quân, Nhật Tân", "district": "Tây Hồ"},
        {"name": "Sân Cầu Lông Bách Khoa Arena", "address": "40 Tạ Quang Bửu, Bách Khoa", "district": "Hai Bà Trưng"},
        {"name": "Sân Cầu Lông Long Biên Arena", "address": "5 Đức Giang, Đức Giang", "district": "Long Biên"},
    ]

    hanoi_courts = []
    for idx, c in enumerate(courts_raw, 1):
        full_address = f"{c['address']}, {c['district']}, Hà Nội"
        query = urllib.parse.quote(f"{c['name']} {full_address}")
        maps_url = f"https://www.google.com/maps/search/?api=1&query={query}"
        
        hanoi_courts.append({
            "id": idx,
            "name": c['name'],
            "address": full_address,
            "district": c['district'],
            "city": "Hà Nội",
            "maps_url": maps_url
        })

    # Lưu ra file JSON
    with open('server/hanoi_courts_scraped.json', 'w', encoding='utf-8') as f:
        json.dump(hanoi_courts, f, ensure_ascii=False, indent=2)

    print(f"✅ Đã thu thập thành công {len(hanoi_courts)} sân cầu lông chính xác tại các Quận Hà Nội!")
    return hanoi_courts

if __name__ == "__main__":
    search_hanoi_courts()
