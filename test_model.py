"""
🧪 Test Falcon Detection Model
Tests trained model on test3 dataset (1,408 images)
"""

import torch
from ultralytics import YOLO
from pathlib import Path
import json
from datetime import datetime

print("="*60)
print("🧪 FALCON DETECTION - MODEL TESTING")
print("NASA Space Apps Challenge 2025")
print("="*60)

# Model path
MODEL_PATH = "runs/train/falcon_yolov8m_final/weights/best.pt"

# Check if model exists
model_file = Path(MODEL_PATH)
if not model_file.exists():
    print(f"\n❌ Model not found at: {MODEL_PATH}")
    print("📝 Train the model first:")
    print("   python train_model.py")
    exit(1)

# Load model
print(f"\n📦 Loading model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)

# Check GPU
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"🔧 Device: {device}")

# Test dataset
data_yaml = 'dataset.yaml'
print(f"\n🎯 Testing on test3 dataset (1,408 images)")
print("="*60)

# Run validation on test set
results = model.val(
    data=data_yaml,
    split='test',
    batch=16,
    imgsz=640,
    device=device,
    plots=True,
    save_json=True,
    conf=0.25,
    iou=0.45,
    verbose=True
)

# Print results
print("\n" + "="*60)
print("📊 TEST RESULTS")
print("="*60)

metrics = results.results_dict
print(f"\n✅ mAP@0.5:     {metrics.get('metrics/mAP50(B)', 0):.4f}")
print(f"✅ mAP@0.5:0.95: {metrics.get('metrics/mAP50-95(B)', 0):.4f}")
print(f"✅ Precision:    {metrics.get('metrics/precision(B)', 0):.4f}")
print(f"✅ Recall:       {metrics.get('metrics/recall(B)', 0):.4f}")

# Check if target met
mAP50 = metrics.get('metrics/mAP50(B)', 0)
if mAP50 >= 0.95:
    print(f"\n🎉 TARGET ACHIEVED! mAP@0.5 = {mAP50:.2%} >= 95%")
else:
    print(f"\n⚠️  Target not met. mAP@0.5 = {mAP50:.2%} < 95%")
    print("   Consider training for more epochs or adjusting hyperparameters")

# Save test report
report = {
    "test_date": datetime.now().isoformat(),
    "model_path": str(MODEL_PATH),
    "test_dataset": "test3 (1408 images)",
    "metrics": {
        "mAP@0.5": float(mAP50),
        "mAP@0.5:0.95": float(metrics.get('metrics/mAP50-95(B)', 0)),
        "precision": float(metrics.get('metrics/precision(B)', 0)),
        "recall": float(metrics.get('metrics/recall(B)', 0)),
    },
    "target_achieved": mAP50 >= 0.95,
    "project": "NASA Space Apps Challenge 2025 - Falcon Detection",
    "team": "Duality AI"
}

report_file = "test_report.json"
with open(report_file, 'w') as f:
    json.dump(report, f, indent=2)

print(f"\n📄 Test report saved: {report_file}")
print("\n" + "="*60)
print("✅ Testing Complete!")
print("="*60)
