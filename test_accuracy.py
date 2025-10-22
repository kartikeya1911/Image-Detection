"""
Test Model Accuracy on test3 Dataset
Evaluates YOLOv8m model performance with detailed metrics
"""

import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

from ultralytics import YOLO
from pathlib import Path
import torch
import yaml
import json
from datetime import datetime

def load_config():
    """Load dataset configuration"""
    with open('dataset.yaml', 'r') as f:
        config = yaml.safe_load(f)
    return config

def test_model_accuracy():
    """
    Test the trained model on test3 dataset
    Calculates: mAP50, mAP50-95, Precision, Recall, F1-Score
    """
    
    print("\n" + "="*70)
    print("🎯 FALCON MODEL ACCURACY TEST")
    print("="*70)
    
    # Load configuration
    config = load_config()
    
    # Model paths (try trained model first, fallback to pretrained)
    trained_model_path = Path("runs/train/falcon_yolov8m_final/weights/best.pt")
    pretrained_model_path = Path("yolov8m.pt")
    
    if trained_model_path.exists():
        model_path = trained_model_path
        print(f"✅ Using trained model: {model_path}")
    else:
        model_path = pretrained_model_path
        print(f"⚠️  Trained model not found, using pretrained: {model_path}")
    
    # Load model
    print("\n📦 Loading model...")
    model = YOLO(str(model_path))
    
    # Check CUDA availability
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"🖥️  Device: {device.upper()}")
    if device == 'cuda':
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    
    # Test dataset path
    test_data_path = Path(config['path']) / config['test']
    print(f"\n📁 Test dataset: {test_data_path}")
    print(f"   Number of classes: {config['nc']}")
    print(f"   Class names: {', '.join(config['names'].values())}")
    
    # Run validation on test set
    print("\n🔬 Running accuracy test...")
    print("-" * 70)
    
    try:
        # Validate model on test dataset
        metrics = model.val(
            data='dataset.yaml',
            split='test',
            batch=8,
            imgsz=640,
            device=device,
            plots=True,
            save_json=True,
            conf=0.25,  # Confidence threshold
            iou=0.6,    # IoU threshold for NMS
        )
        
        print("\n" + "="*70)
        print("📊 ACCURACY TEST RESULTS")
        print("="*70)
        
        # Overall metrics
        print(f"\n🎯 Overall Performance:")
        print(f"   mAP50     : {metrics.box.map50:.4f} ({metrics.box.map50*100:.2f}%)")
        print(f"   mAP50-95  : {metrics.box.map:.4f} ({metrics.box.map*100:.2f}%)")
        print(f"   Precision : {metrics.box.mp:.4f} ({metrics.box.mp*100:.2f}%)")
        print(f"   Recall    : {metrics.box.mr:.4f} ({metrics.box.mr*100:.2f}%)")
        
        # Calculate F1-Score
        if metrics.box.mp > 0 and metrics.box.mr > 0:
            f1_score = 2 * (metrics.box.mp * metrics.box.mr) / (metrics.box.mp + metrics.box.mr)
            print(f"   F1-Score  : {f1_score:.4f} ({f1_score*100:.2f}%)")
        
        # Per-class metrics
        print(f"\n📋 Per-Class Performance:")
        print(f"{'Class':<25} {'Precision':<12} {'Recall':<12} {'mAP50':<12}")
        print("-" * 70)
        
        class_names = list(config['names'].values())
        for i, class_name in enumerate(class_names):
            precision = metrics.box.p[i] if i < len(metrics.box.p) else 0
            recall = metrics.box.r[i] if i < len(metrics.box.r) else 0
            map50 = metrics.box.ap50[i] if i < len(metrics.box.ap50) else 0
            
            # Format class name
            display_name = class_name.replace('_', ' ')
            print(f"{display_name:<25} {precision*100:>6.2f}%      {recall*100:>6.2f}%      {map50*100:>6.2f}%")
        
        # Save results to JSON
        results = {
            'timestamp': datetime.now().isoformat(),
            'model_path': str(model_path),
            'device': device,
            'test_dataset': str(test_data_path),
            'overall_metrics': {
                'mAP50': float(metrics.box.map50),
                'mAP50_95': float(metrics.box.map),
                'precision': float(metrics.box.mp),
                'recall': float(metrics.box.mr),
                'f1_score': float(f1_score) if metrics.box.mp > 0 and metrics.box.mr > 0 else 0.0
            },
            'per_class_metrics': {}
        }
        
        for i, class_name in enumerate(class_names):
            results['per_class_metrics'][class_name] = {
                'precision': float(metrics.box.p[i]) if i < len(metrics.box.p) else 0.0,
                'recall': float(metrics.box.r[i]) if i < len(metrics.box.r) else 0.0,
                'mAP50': float(metrics.box.ap50[i]) if i < len(metrics.box.ap50) else 0.0
            }
        
        # Save to file
        results_file = Path('test_accuracy_results.json')
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: {results_file}")
        print(f"📈 Validation plots saved to: runs/detect/val/")
        
        print("\n" + "="*70)
        print("✅ Accuracy test completed successfully!")
        print("="*70 + "\n")
        
        return results
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Prevent multiprocessing issues on Windows
    import multiprocessing
    multiprocessing.freeze_support()
    
    # Run accuracy test
    results = test_model_accuracy()
    
    if results:
        print("🎉 Test completed! Check the results above.")
    else:
        print("❌ Test failed. Check the error messages above.")
