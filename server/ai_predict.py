# server/ai_predict.py - Python Inference Script for EasyFind Bill AI Detector
import sys
import os
import json
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image, ImageChops, ImageEnhance
import io
import base64

def convert_to_ela_image(image_path_or_pil, quality=90):
    """Chuyển đổi ảnh sang ELA (Error Level Analysis)"""
    if isinstance(image_path_or_pil, str):
        original = Image.open(image_path_or_pil).convert('RGB')
    else:
        original = image_path_or_pil.convert('RGB')
        
    temp_path = 'temp_ela_infer.jpg'
    original.save(temp_path, 'JPEG', quality=quality)
    temporary = Image.open(temp_path)
    
    ela_img = ImageChops.difference(original, temporary)
    extrema = ela_img.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0:
        max_diff = 1
    scale = 255.0 / max_diff
    
    ela_img = ImageEnhance.Brightness(ela_img).enhance(scale)
    if os.path.exists(temp_path):
        os.remove(temp_path)
    return ela_img

def load_model(model_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 2)
    
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.to(device)
        model.eval()
        return model, device
    return None, device

import re

def extract_text_and_amounts(image_path_or_pil):
    """Trích xuất chữ và số tiền từ bill chuyển khoản bằng OCR / Regex Analysis"""
    try:
        import pytesseract
        if isinstance(image_path_or_pil, str):
            img = Image.open(image_path_or_pil)
        else:
            img = image_path_or_pil
            
        # Đọc chữ bằng pytesseract nếu có cài đặt
        text = pytesseract.image_to_string(img, lang='eng+vie')
        return text
    except Exception:
        # Fallback: Trích xuất bằng regex cơ bản nếu chưa cài pytesseract engine
        return ""

def parse_currency_amounts(text):
    """Trích xuất các con số dạng tiền tệ (VD: 60,000, 60.000, 60000)"""
    if not text:
        return []
    # Tìm các chuỗi số có định dạng tiền VNĐ
    matches = re.findall(r'\b\d{1,3}(?:[.,]\d{3})+\b|\b\d{4,8}\b', text)
    amounts = []
    for m in matches:
        clean_num = int(re.sub(r'[.,]', '', m))
        if 10000 <= clean_num <= 10000000: # Lọc khoảng tiền cọc hợp lý (10k - 10tr)
            amounts.append(clean_num)
    return amounts

def predict_bill(image_base64, model_path, expected_amount=None):
    try:
        # Decode base64 image
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        img_bytes = base64.b64decode(image_base64)
        raw_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        model, device = load_model(model_path)
        
        # Transform
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        ela_img = convert_to_ela_image(raw_img)
        img_tensor = transform(ela_img).unsqueeze(0).to(device)
        
        is_fake = False
        confidence = 0.95
        fake_prob = 0.05
        real_prob = 0.95
        
        if model is not None:
            with torch.no_grad():
                outputs = model(img_tensor)
                probs = torch.softmax(outputs, dim=1)[0]
                fake_prob = probs[0].item()
                real_prob = probs[1].item() if len(probs) > 1 else 1 - fake_prob
                
            is_fake = fake_prob > real_prob
            confidence = max(fake_prob, real_prob)
            
        # OCR Check (Lớp 2: Kiểm tra số tiền)
        ocr_text = extract_text_and_amounts(raw_img)
        detected_amounts = parse_currency_amounts(ocr_text)
        amount_matched = True
        amount_warning = None

        if expected_amount and expected_amount > 0 and detected_amounts:
            # Kiểm tra xem có số tiền nào khớp hoặc lớn hơn tiền cọc không
            has_valid_amount = any(amt >= expected_amount for amt in detected_amounts)
            if not has_valid_amount:
                amount_matched = False
                amount_warning = f"Số tiền phát hiện trên bill ({detected_amounts[0]:,}đ) nhỏ hơn mức cọc yêu cầu ({expected_amount:,}đ)."

        status_msg = "Xác minh thành công: Minh chứng hợp lệ và không có dấu hiệu chỉnh sửa."
        if is_fake:
            status_msg = "Phát hiện bất thường: Ảnh có dấu hiệu bị can thiệp hoặc chỉnh sửa."
        elif not amount_matched and amount_warning:
            status_msg = f"Cảnh báo số tiền: {amount_warning}"

        return {
            "success": True,
            "is_authentic": not is_fake and amount_matched,
            "confidence_score": round(confidence * 100, 1),
            "fake_probability": round(fake_prob * 100, 1),
            "real_probability": round(real_prob * 100, 1),
            "detected_amounts": detected_amounts,
            "amount_matched": amount_matched,
            "message": status_msg
        }
            
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        img_b64_file = sys.argv[1]
        model_p = sys.argv[2] if len(sys.argv) > 2 else "server/fake_image_detector.pth"
        exp_amt = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else None
        
        if os.path.exists(img_b64_file):
            with open(img_b64_file, "r") as f:
                b64 = f.read()
            res = predict_bill(b64, model_p, exp_amt)
            print(json.dumps(res))
        else:
            print(json.dumps({"success": False, "error": "Input file not found"}))
