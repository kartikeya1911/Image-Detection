"""
🚀 Falcon Detection - Full Training Script
NASA Space Apps Challenge 2025

Train YOLOv8m on your train_3 dataset
Target: >95% mAP@0.5

Dataset:
- Train: 1,769 images
- Val: 338 images  
- Test: 1,408 images
"""

import os
# Fix OpenMP duplicate library error on Windows
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import torch
from ultralytics import YOLO
from pathlib import Path
import yaml

# Monkey-patch the update check to prevent network timeouts
from ultralytics.utils import checks
checks.check_pip_update_available = lambda: None

if __name__ == '__main__':
    print("="*60)
    print("🛰️  FALCON DETECTION - FULL TRAINING")
    print("NASA Space Apps Challenge 2025 - Duality AI")
    print("="*60)

    # Check GPU
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\n🔧 Device: {device}")
    if device == 'cuda':
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        # Clear GPU cache to prevent memory issues
        torch.cuda.empty_cache()
        print("   GPU cache cleared")

    # Dataset configuration
    data_yaml = 'dataset.yaml'
    print(f"\n📁 Dataset: {data_yaml}")

    # Load and verify dataset info
    with open(data_yaml, 'r') as f:
        data_config = yaml.safe_load(f)

    print(f"   Train: {data_config['info']['train_images']} images")
    print(f"   Val: {data_config['info']['val_images']} images")
    print(f"   Test: {data_config['info']['test_images']} images")
    print(f"   Classes: {data_config['nc']}")

    # Load YOLOv8m model
    print("\n📦 Loading YOLOv8m model...")
    model = YOLO('yolov8m.pt')

    # Training parameters
    EPOCHS = 100  # Full training for >95% mAP
    BATCH_SIZE = 8  # Reduced from 16 to prevent GPU memory issues
    IMG_SIZE = 640

    print("\n⚙️  Training Configuration:")
    print(f"   Epochs: {EPOCHS}")
    print(f"   Batch Size: {BATCH_SIZE}")
    print(f"   Image Size: {IMG_SIZE}x{IMG_SIZE}")
    print(f"   Device: {device}")
    print(f"   Target mAP@0.5: >95%")

    print("\n🏋️  Starting Training...")
    print("="*60)

    # Train the model
    results = model.train(
        data=data_yaml,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        device=device,
        
        # Project settings
        project='runs/train',
        name='falcon_yolov8m_final',
        exist_ok=True,
        
        # Optimization
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.00001,
        momentum=0.9,
        weight_decay=0.0005,
        warmup_epochs=5,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        
        # Augmentations
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        shear=2.0,
        perspective=0.0001,
        flipud=0.0,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.15,
        copy_paste=0.0,
        
    # Training settings
    patience=50,
    save=True,
    save_period=10,
    cache=False,  # Disable caching to avoid memory issues
    workers=2,  # Reduced from 4 to 2 workers
    amp=True,  # Mixed precision
    verbose=True,        # Validation
        val=True,
        plots=True,
    )

    print("\n" + "="*60)
    print("✅ Training Complete!")
    print("="*60)

    # Print results
    print("\n📊 Training Results:")
    print(f"   mAP@0.5: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
    print(f"   mAP@0.5:0.95: {results.results_dict.get('metrics/mAP50-95(B)', 'N/A')}")
    print(f"   Precision: {results.results_dict.get('metrics/precision(B)', 'N/A')}")
    print(f"   Recall: {results.results_dict.get('metrics/recall(B)', 'N/A')}")

    print("\n📁 Model saved to:")
    print(f"   runs/train/falcon_yolov8m_final/weights/best.pt")
    print(f"   runs/train/falcon_yolov8m_final/weights/last.pt")

    print("\n🎯 Next Steps:")
    print("1. Test model: python test_model.py")
    print("2. Optimize for web: cd backend && update MODEL_PATH in app.py")
    print("3. Optimize for mobile: python ../../optimization/optimize_model.py")
    print("4. Deploy and demo!")

    print("\n🚀 Ready for NASA Space Apps submission!")
    print("="*60)
