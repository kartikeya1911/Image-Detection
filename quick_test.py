"""
Quick Test - 5 Sample Images
Tests model on diverse sample images from test3 dataset
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

from ultralytics import YOLO
from pathlib import Path
import cv2
import numpy as np

# Sample images (diverse conditions)
SAMPLE_IMAGES = [
    "test3/images/000000046_light_unclutter.png",      # Easy: Light, uncluttered
    "test3/images/000000071_light_unclutter.png",      # Easy: Light, uncluttered
    "test3/images/000000001_dark_clutter.png",         # Medium: Dark + clutter
    "test3/images/000000005_vdark_clutter.png",        # Hard: Very dark + clutter
    "test3/images/000000117_vlight_unclutter.png",     # Easy: Very light
]

CLASS_NAMES = [
    'Oxygen Tank',
    'Nitrogen Tank',
    'First Aid Box',
    'Fire Alarm',
    'Safety Switch Panel',
    'Emergency Phone',
    'Fire Extinguisher'
]

CLASS_EMOJIS = ['🔴', '💧', '🏥', '🚨', '⚡', '📞', '🧯']

def test_quick_samples():
    print("\n" + "="*70)
    print("🎯 QUICK TEST - 5 Sample Images")
    print("="*70)
    
    # Load model
    trained_model_path = Path("runs/train/falcon_yolov8m_final/weights/best.pt")
    pretrained_model_path = Path("yolov8m.pt")
    
    if trained_model_path.exists():
        model_path = trained_model_path
        print(f"✅ Using trained model: {model_path}")
    else:
        model_path = pretrained_model_path
        print(f"⚠️  Using pretrained model: {model_path}")
        print("   (Train your model for better results)")
    
    print("\n📦 Loading model...")
    model = YOLO(str(model_path))
    
    # Test each sample
    total_detections = 0
    total_confidence = 0
    all_results = []
    
    print("\n🧪 Testing sample images...")
    print("-" * 70)
    
    for idx, img_path in enumerate(SAMPLE_IMAGES, 1):
        full_path = Path(img_path)
        
        if not full_path.exists():
            print(f"❌ Image not found: {img_path}")
            continue
        
        print(f"\n📸 Test {idx}/{len(SAMPLE_IMAGES)}: {full_path.name}")
        
        # Run inference
        results = model(str(full_path), conf=0.25, verbose=False)
        
        # Get detections
        if len(results) > 0 and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            num_detections = len(boxes)
            
            print(f"   ✅ Found {num_detections} object(s)")
            
            # Count objects by class
            class_counts = {}
            confidences = []
            
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = CLASS_NAMES[cls_id]
                emoji = CLASS_EMOJIS[cls_id]
                
                if class_name not in class_counts:
                    class_counts[class_name] = 0
                class_counts[class_name] += 1
                confidences.append(conf)
                
                total_detections += 1
                total_confidence += conf
                
                print(f"      {emoji} {class_name}: {conf*100:.1f}%")
            
            # Show summary for this image
            if confidences:
                avg_conf = np.mean(confidences)
                print(f"   📊 Avg Confidence: {avg_conf*100:.1f}%")
                print(f"   📈 Highest: {max(confidences)*100:.1f}%")
                print(f"   📉 Lowest: {min(confidences)*100:.1f}%")
            
            all_results.append({
                'image': full_path.name,
                'detections': num_detections,
                'classes': class_counts,
                'avg_confidence': avg_conf if confidences else 0
            })
        else:
            print(f"   ⚠️  No objects detected")
            all_results.append({
                'image': full_path.name,
                'detections': 0,
                'classes': {},
                'avg_confidence': 0
            })
    
    # Overall summary
    print("\n" + "="*70)
    print("📊 QUICK TEST SUMMARY")
    print("="*70)
    
    print(f"\n🎯 Overall Statistics:")
    print(f"   Total images tested: {len(SAMPLE_IMAGES)}")
    print(f"   Total detections: {total_detections}")
    if total_detections > 0:
        print(f"   Average confidence: {(total_confidence/total_detections)*100:.1f}%")
    
    # Per-image summary
    print(f"\n📋 Per-Image Results:")
    for result in all_results:
        print(f"   {result['image']}: {result['detections']} objects "
              f"({result['avg_confidence']*100:.1f}% avg)")
    
    # Object type distribution
    print(f"\n📦 Object Type Distribution:")
    all_classes = {}
    for result in all_results:
        for cls, count in result['classes'].items():
            if cls not in all_classes:
                all_classes[cls] = 0
            all_classes[cls] += count
    
    if all_classes:
        for cls, count in sorted(all_classes.items(), key=lambda x: x[1], reverse=True):
            emoji_idx = CLASS_NAMES.index(cls)
            emoji = CLASS_EMOJIS[emoji_idx]
            print(f"   {emoji} {cls}: {count}")
    else:
        print("   No objects detected across all images")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    if total_detections == 0:
        print("   ⚠️  No objects detected - check if model is trained properly")
    elif total_confidence / total_detections < 0.5:
        print("   ⚠️  Low confidence - model may need more training")
    elif total_confidence / total_detections < 0.7:
        print("   ✅ Moderate performance - consider more training epochs")
    else:
        print("   ✅ Good performance! Model is detecting well")
    
    print("\n" + "="*70)
    print("✅ Quick test completed!")
    print("="*70)
    
    print("\n🔍 Next Steps:")
    print("   1. Upload images via web interface: http://localhost:3000")
    print("   2. Run full accuracy test: python test_accuracy.py")
    print("   3. Test more images from test3/images/ folder")
    
    return all_results

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()
    
    test_quick_samples()
