"""
🔍 Training Monitor - Check YOLOv8m Training Progress
"""

from pathlib import Path
import time

print("🔍 Falcon Detection Training Monitor")
print("="*60)

# Training directory
train_dir = Path("runs/train/falcon_yolov8m_final")

if not train_dir.exists():
    print("❌ Training not started yet")
    print("   Run: python train_model.py")
    exit(1)

print(f"📁 Training Directory: {train_dir}")
print()

# Check args.yaml
args_file = train_dir / "args.yaml"
if args_file.exists():
    print("✅ Training configuration loaded")
    print(f"   File: {args_file}")
else:
    print("⚠️  Configuration not found")

# Check results.csv
results_file = train_dir / "results.csv"
if results_file.exists():
    print("\n📊 Training Results:")
    print("-" * 60)
    
    # Read last 5 lines
    with open(results_file, 'r') as f:
        lines = f.readlines()
    
    if len(lines) > 1:
        # Print header
        print(lines[0].strip())
        
        # Print last few epochs
        for line in lines[-5:]:
            print(line.strip())
        
        # Parse latest epoch
        latest = lines[-1].strip().split(',')
        if len(latest) > 1:
            epoch = latest[0].strip()
            try:
                # Typical YOLO results.csv format
                print(f"\n🎯 Latest Epoch: {epoch}")
                print(f"   Training complete: {len(lines)-1} epochs")
            except:
                pass
    else:
        print("   Results file created but no data yet")
else:
    print("\n⏳ Training in Progress...")
    print("   results.csv will be created after first epoch")
    print("   This usually takes 5-10 minutes for first epoch")

# Check weights
weights_dir = train_dir / "weights"
if weights_dir.exists():
    weights = list(weights_dir.glob("*.pt"))
    if weights:
        print(f"\n💾 Model Weights:")
        for w in weights:
            size_mb = w.stat().st_size / (1024*1024)
            print(f"   ✅ {w.name}: {size_mb:.1f} MB")
    else:
        print(f"\n💾 Weights directory created (models will be saved here)")

# Check for plots
plots = list(train_dir.glob("*.png"))
if plots:
    print(f"\n📈 Training Plots: {len(plots)} generated")
    for p in plots[:5]:
        print(f"   📊 {p.name}")

print("\n" + "="*60)
print("💡 Tips:")
print("   - First epoch: ~5-10 minutes")
print("   - Full training (100 epochs): ~3-5 hours")
print("   - Check results.csv for metrics after each epoch")
print("   - Best model saved automatically to weights/best.pt")
print("\n🔄 Run this script again to check updated progress")
print("="*60)
