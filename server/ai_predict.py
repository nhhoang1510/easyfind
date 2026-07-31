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

def predict_bill(image_base64, model_path):
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
        
        if model is not None:
            with torch.no_grad():
                outputs = model(img_tensor)
                probs = torch.softmax(outputs, dim=1)[0]
                fake_prob = probs[0].item()
                real_prob = probs[1].item() if len(probs) > 1 else 1 - fake_prob
                
            is_fake = fake_prob > real_prob
            confidence = max(fake_prob, real_prob)
            
            return {
                "success": True,
                "is_authentic": not is_fake,
                "confidence_score": round(confidence * 100, 1),
                "fake_probability": round(fake_prob * 100, 1),
                "real_probability": round(real_prob * 100, 1),
                "message": "Xác minh thành công: Minh chứng hợp lệ và không có dấu hiệu chỉnh sửa." if not is_fake else "Phát hiện bất thường: Ảnh có dấu hiệu bị can thiệp hoặc chỉnh sửa."
            }
        else:
            return {"success": False, "error": "Model file not found"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        img_b64_file = sys.argv[1]
        model_p = sys.argv[2] if len(sys.argv) > 2 else "server/fake_image_detector.pth"
        
        if os.path.exists(img_b64_file):
            with open(img_b64_file, "r") as f:
                b64 = f.read()
            res = predict_bill(b64, model_p)
            print(json.dumps(res))
        else:
            print(json.dumps({"success": False, "error": "Input file not found"}))
