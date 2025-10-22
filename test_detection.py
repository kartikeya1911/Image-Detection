"""
Quick test script to verify detection is working
"""
import requests
import os
from pathlib import Path

# Test configuration
API_URL = "http://localhost:8000"
TEST_IMAGE_DIR = Path("test3/images")

def test_detection():
    """Test detection with a sample image"""
    print("🧪 Testing Detection API...")
    print(f"API URL: {API_URL}")
    
    # Check API health
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API is healthy")
            print(f"   Model loaded: {data['model_loaded']}")
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        print("Make sure the backend is running: cd backend && python app.py")
        return
    
    # Find a test image
    if not TEST_IMAGE_DIR.exists():
        print(f"❌ Test image directory not found: {TEST_IMAGE_DIR}")
        return
    
    image_files = list(TEST_IMAGE_DIR.glob("*.jpg")) + list(TEST_IMAGE_DIR.glob("*.png"))
    if not image_files:
        print(f"❌ No images found in {TEST_IMAGE_DIR}")
        return
    
    test_image = image_files[0]
    print(f"\n📷 Testing with image: {test_image.name}")
    print(f"   Size: {test_image.stat().st_size / 1024:.1f} KB")
    
    # Send detection request
    try:
        with open(test_image, 'rb') as f:
            files = {'file': (test_image.name, f, 'image/jpeg')}
            response = requests.post(f"{API_URL}/predict/image", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Detection successful!")
            print(f"   Detections found: {data['num_detections']}")
            print(f"   Inference time: {data['inference_time_ms']:.2f} ms")
            
            if data['num_detections'] > 0:
                print(f"\n📊 Detected Objects:")
                for i, det in enumerate(data['detections'], 1):
                    class_name = det['class'].replace('_', ' ')
                    print(f"   {i}. {class_name}")
                    print(f"      Confidence: {det['confidence']*100:.2f}%")
                    print(f"      Position: ({det['bbox']['x1']:.0f}, {det['bbox']['y1']:.0f}) to ({det['bbox']['x2']:.0f}, {det['bbox']['y2']:.0f})")
            else:
                print(f"\n⚠️  No objects detected")
                print(f"   This might mean:")
                print(f"   - The image doesn't contain trained objects")
                print(f"   - Confidence threshold is too high (current: 0.15)")
                print(f"   - Model needs more training")
        else:
            print(f"❌ Detection failed: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Detection request failed: {e}")

if __name__ == "__main__":
    test_detection()
