"""
🚀 Falcon Detection Backend - FastAPI Server
NASA Space Apps Challenge 2025

Features:
- Image upload detection
- Real-time webcam detection
- REST API with CORS support
- YOLOv8m inference
- Detection history logging
"""

import os
# Force CPU mode to avoid GPU memory conflicts during training
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import json
from datetime import datetime
from pathlib import Path
import base64
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Falcon Object Detection API",
    description="NASA Space Apps Challenge 2025 - Space Safety Object Detection",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
MODEL_PATH = "../runs/train/falcon_yolov8m_final/weights/best.pt"
CONFIDENCE_THRESHOLD = 0.15  # Lowered for better detection
IOU_THRESHOLD = 0.45

# Class names
CLASS_NAMES = [
    'Oxygen_Tank',
    'Nitrogen_Tank',
    'First_Aid_Box',
    'Fire_Alarm',
    'Safety_Switch_Panel',
    'Emergency_Phone',
    'Fire_Extinguisher'
]

# Detection history (in-memory storage)
detection_history = []

def load_model():
    """Load YOLOv8m model"""
    global model
    try:
        # Priority order for model paths
        model_paths = [
            Path(MODEL_PATH),  # Trained model in runs/train/
            Path("yolov8m.pt"),  # Local backup model
            Path("../yolov8m.pt"),  # Parent directory
        ]
        
        model_loaded = False
        for model_path in model_paths:
            if model_path.exists():
                logger.info(f"Loading model from {model_path}")
                model = YOLO(str(model_path))
                logger.info(f"✅ Model loaded successfully from {model_path}")
                
                # Check if this is the trained model
                if "falcon_yolov8m" in str(model_path):
                    logger.info("🎯 Using trained Falcon Detection model")
                else:
                    logger.warning("⚠️  Using pretrained YOLOv8m (not trained on your data)")
                    logger.warning("For best results, train your model: python train_model.py")
                
                model_loaded = True
                break
        
        if not model_loaded:
            logger.error("❌ No model file found")
            return False
        
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    logger.info("🚀 Starting Falcon Detection API...")
    if load_model():
        logger.info("✅ API ready!")
    else:
        logger.error("❌ Failed to initialize model")

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "🛰️ Falcon Detection API - NASA Space Apps Challenge 2025",
        "status": "online",
        "model_loaded": model is not None,
        "version": "1.0.0",
        "endpoints": {
            "predict_image": "/predict/image",
            "predict_base64": "/predict/base64",
            "health": "/health",
            "history": "/history",
            "stats": "/stats"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    """
    Predict objects in uploaded image
    
    Args:
        file: Image file (jpg, png, etc.)
    
    Returns:
        JSON with detections, annotated image, and metadata
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Log image info
        logger.info(f"Processing image: {image.shape[1]}x{image.shape[0]} pixels")
        
        # Run inference with optimized parameters
        logger.info(f"Running inference (conf={CONFIDENCE_THRESHOLD}, iou={IOU_THRESHOLD})")
        results = model.predict(
            image,
            conf=CONFIDENCE_THRESHOLD,
            iou=IOU_THRESHOLD,
            imgsz=640,  # Standard YOLO size
            verbose=False,
            device='cpu'  # Force CPU since we disabled CUDA
        )[0]
        
        logger.info(f"Raw detections: {len(results.boxes)} objects found")
        
        # Process detections
        detections = []
        annotated_image = image.copy()
        
        for box in results.boxes:
            # Extract box data
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            
            # Get class name - handle both trained and pretrained models
            if hasattr(model, 'names') and class_id in model.names:
                class_name = model.names[class_id]
            elif class_id < len(CLASS_NAMES):
                class_name = CLASS_NAMES[class_id]
            else:
                class_name = f"Unknown_{class_id}"
            
            logger.info(f"Detected: {class_name} (conf: {confidence:.2f})")
            
            # Add to detections list
            detections.append({
                "class": class_name,
                "class_id": class_id,
                "confidence": round(confidence, 4),
                "bbox": {
                    "x1": float(x1),
                    "y1": float(y1),
                    "x2": float(x2),
                    "y2": float(y2),
                    "width": float(x2 - x1),
                    "height": float(y2 - y1)
                }
            })
            
            # Draw bounding box with thicker line
            color = get_color_for_class(class_id)
            cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), color, 3)
            
            # Format class name with spaces instead of underscores
            display_name = class_name.replace('_', ' ')
            
            # Draw label with background - larger and more visible
            label = f"{display_name} {confidence:.1%}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            font_thickness = 2
            
            label_size, baseline = cv2.getTextSize(label, font, font_scale, font_thickness)
            
            # Draw filled rectangle for label background
            cv2.rectangle(
                annotated_image,
                (int(x1), int(y1) - label_size[1] - 15),
                (int(x1) + label_size[0] + 10, int(y1)),
                color,
                -1
            )
            
            # Draw label text in white
            cv2.putText(
                annotated_image,
                label,
                (int(x1) + 5, int(y1) - 8),
                font,
                font_scale,
                (255, 255, 255),
                font_thickness
            )
        
        # Convert annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Create response
        response = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "num_detections": len(detections),
            "detections": detections,
            "image": {
                "width": image.shape[1],
                "height": image.shape[0],
                "annotated": f"data:image/jpeg;base64,{img_base64}"
            },
            "inference_time_ms": float(results.speed['inference']),
        }
        
        # Save to history
        detection_history.append({
            "timestamp": response["timestamp"],
            "num_detections": len(detections),
            "objects": [d["class"] for d in detections]
        })
        
        # Keep only last 100 detections
        if len(detection_history) > 100:
            detection_history.pop(0)
        
        return JSONResponse(content=response)
        
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/base64")
async def predict_base64(data: Dict[str, Any]):
    """
    Predict objects from base64 encoded image (for webcam streams)
    
    Args:
        data: JSON with 'image' field containing base64 string
    
    Returns:
        JSON with detections
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Decode base64 image
        image_data = data.get('image', '')
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Run inference
        results = model.predict(
            image,
            conf=CONFIDENCE_THRESHOLD,
            iou=IOU_THRESHOLD,
            verbose=False
        )[0]
        
        # Process detections
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else f"Class_{class_id}"
            
            detections.append({
                "class": class_name,
                "class_id": class_id,
                "confidence": round(confidence, 4),
                "bbox": {
                    "x1": float(x1),
                    "y1": float(y1),
                    "x2": float(x2),
                    "y2": float(y2)
                }
            })
        
        return JSONResponse(content={
            "success": True,
            "num_detections": len(detections),
            "detections": detections,
            "inference_time_ms": float(results.speed['inference'])
        })
        
    except Exception as e:
        logger.error(f"Error during base64 prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    """Get detection history"""
    return {
        "total_detections": len(detection_history),
        "history": detection_history[-20:]  # Last 20 detections
    }

@app.get("/stats")
async def get_stats():
    """Get detection statistics"""
    if not detection_history:
        return {
            "total_sessions": 0,
            "total_objects_detected": 0,
            "most_detected": None
        }
    
    # Count object occurrences
    object_counts = {}
    total_objects = 0
    
    for detection in detection_history:
        for obj in detection.get('objects', []):
            object_counts[obj] = object_counts.get(obj, 0) + 1
            total_objects += 1
    
    most_detected = max(object_counts.items(), key=lambda x: x[1])[0] if object_counts else None
    
    return {
        "total_sessions": len(detection_history),
        "total_objects_detected": total_objects,
        "most_detected": most_detected,
        "object_breakdown": object_counts
    }

@app.delete("/history")
async def clear_history():
    """Clear detection history"""
    global detection_history
    detection_history = []
    return {"success": True, "message": "History cleared"}

def get_color_for_class(class_id: int) -> tuple:
    """Get consistent color for each class"""
    colors = [
        (255, 107, 107),  # Red - Oxygen Tank
        (78, 205, 196),   # Cyan - Nitrogen Tank
        (69, 183, 209),   # Blue - First Aid Box
        (255, 160, 122),  # Light Salmon - Fire Alarm
        (152, 216, 200),  # Mint - Safety Switch Panel
        (247, 220, 111),  # Yellow - Emergency Phone
        (231, 76, 60),    # Dark Red - Fire Extinguisher
    ]
    return colors[class_id % len(colors)]

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Falcon Detection API Server...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 Docs available at: http://localhost:8000/docs")
    print("🔧 Admin interface at: http://localhost:8000/redoc")
    print("\n⚡ Press Ctrl+C to stop\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
