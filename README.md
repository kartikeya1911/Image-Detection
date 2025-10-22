<div align="center">

# 🛰️ Falcon Detection - Space Safety Object Detection

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-blue.svg)](https://www.spaceappschallenge.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)](https://fastapi.tiangolo.com/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**NASA Space Apps Challenge 2025 - Duality AI**

*An AI-powered web application for detecting critical space safety objects using YOLOv8 deep learning*

[Features](#-features) • [Installation](#-installation) • [Usage](#-how-to-run) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

---

### 🚀 Quick Start - Get Running in 1 Minute!

1. **Install Prerequisites**: [Python 3.8+](https://www.python.org/) and [Node.js 16+](https://nodejs.org/)
2. **Download** this repository
3. **Double-click** `RUN.bat` in the project folder
4. **Done!** App opens automatically at http://localhost:3000

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Detected Objects](#-detected-objects)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [How to Run](#-how-to-run)
- [Training the Model](#-training-the-model)
- [Testing and Validation](#-testing-and-validation)
- [API Documentation](#-api-documentation)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Overview

The **Falcon Detection** system is an AI-powered web application designed to automatically detect and identify critical safety equipment in space facilities. Built for the NASA Space Apps Challenge 2025, this system leverages the power of YOLOv8 (You Only Look Once) deep learning architecture to provide real-time object detection with exceptional accuracy.

### 🌟 Key Capabilities

| Feature | Description |
|---------|-------------|
| 🖼️ **Image Upload Detection** | Upload and analyze static images for safety equipment |
| 📹 **Real-time Webcam Detection** | Live detection through webcam feed with FPS counter |
| 🎯 **High Accuracy** | Trained on 3,515 images with target mAP@0.5 >95% |
| ⚡ **Fast Inference** | Optimized for real-time processing (~20 FPS) |
| 📊 **Detailed Analytics** | Detection history, confidence scores, and statistics dashboard |
| 🔔 **Alert System** | Real-time notifications for detected objects |
| 🎨 **Modern UI** | Responsive React-based interface with dark mode support |

---

## 🎬 Demo

### Image Upload Detection
<div align="center">
  <img src="docs/demo-upload.gif" alt="Image Upload Detection Demo" width="600"/>
  <p><i>Upload images to detect safety equipment with bounding boxes and confidence scores</i></p>
</div>

### Real-time Webcam Detection
<div align="center">
  <img src="docs/demo-webcam.gif" alt="Webcam Detection Demo" width="600"/>
  <p><i>Live detection through webcam with FPS monitoring and object counting</i></p>
</div>

### Analytics Dashboard
<div align="center">
  <img src="docs/demo-analytics.png" alt="Analytics Dashboard" width="600"/>
  <p><i>Comprehensive analytics with detection history and performance metrics</i></p>
</div>

> **Note**: Add your demo images/GIFs to the `docs/` folder for better visualization

---

## ✨ Features

- 🖼️ **Image Upload Detection** - Analyze uploaded images
- 📹 **Real-time Webcam Detection** - Live object detection
- 📊 **Analytics Dashboard** - View detection statistics and history
- 🎨 **Modern UI** - Responsive and intuitive interface
- 🔔 **Alert System** - Notifications for detected objects
- 📈 **Accuracy Metrics** - mAP, precision, recall statistics
- 💾 **Detection History** - Track all detections over time
- 🎯 **Confidence Scores** - View detection confidence for each object

---

## 🎯 Detected Objects

The system can detect **7 critical space safety objects** with high precision:

<div align="center">

| # | Object | Emoji | Description |
|---|--------|-------|-------------|
| 1 | **Oxygen Tank** | 🔴 | Emergency oxygen supply systems |
| 2 | **Nitrogen Tank** | 💧 | Nitrogen storage containers |
| 3 | **First Aid Box** | 🏥 | Medical emergency supplies |
| 4 | **Fire Alarm** | 🚨 | Fire detection and alert systems |
| 5 | **Safety Switch Panel** | ⚡ | Emergency control panels |
| 6 | **Emergency Phone** | 📞 | Emergency communication devices |
| 7 | **Fire Extinguisher** | 🧯 | Fire suppression equipment |

</div>

Each object is detected with:
- **Bounding box** visualization
- **Confidence score** (0-100%)
- **Real-time tracking** in webcam mode
- **Color-coded labels** for easy identification

---

## 📁 Project Structure

```
web_app/
├── backend/                      # FastAPI backend server
│   ├── app.py                   # Main backend application
│   ├── requirements.txt         # Python dependencies
│   ├── yolov8m.pt              # YOLOv8m pre-trained weights
│   └── yolov8n.pt              # YOLOv8n pre-trained weights
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── App.css             # Styling
│   │   └── index.js            # React entry point
│   ├── public/
│   │   ├── index.html          # HTML template
│   │   └── test_accuracy_results.json  # Accuracy metrics
│   ├── package.json            # Node.js dependencies
│   └── yolov8n.pt             # Model weights for frontend
│
├── runs/                        # Training and validation results
│   ├── train/
│   │   └── falcon_yolov8m_final/
│   │       ├── weights/        # Trained model checkpoints
│   │       │   ├── best.pt     # Best model weights
│   │       │   └── last.pt     # Latest model weights
│   │       ├── results.csv     # Training metrics
│   │       └── args.yaml       # Training arguments
│   └── detect/
│       └── val*/               # Validation results
│
├── train_3/                     # Training dataset
│   ├── train3/images           # Training images (1,769)
│   └── val3/images             # Validation images (338)
│
├── test3/                       # Test dataset
│   └── images/                 # Test images (1,408)
│
├── dataset.yaml                 # Dataset configuration
├── train_model.py              # Model training script
├── test_accuracy.py            # Accuracy testing script
├── test_detection.py           # Detection testing script
├── check_training.py           # Training progress checker
├── quick_test.py               # Quick model testing
│
├── RUN.bat                     # 🚀 One-click launcher (Windows)
├── START_WEB_APP.ps1           # PowerShell start script
├── START_FIXED.ps1             # Alternative start script
├── RESTART_BACKEND.ps1         # Backend restart script
│
├── yolo11n.pt                  # YOLO11n pre-trained weights
└── yolov8m.pt                  # YOLOv8m pre-trained weights
```

---

## 🔧 Prerequisites

### System Requirements:
- **OS**: Windows 10/11, Linux, or macOS
- **RAM**: Minimum 8GB (16GB recommended)
- **GPU**: NVIDIA GPU with CUDA support (optional but recommended)
- **Storage**: At least 5GB free space

### Software Requirements:

#### Python (Backend)
- **Python 3.8+** (Python 3.10 recommended)
- pip (Python package manager)

#### Node.js (Frontend)
- **Node.js 16+** (v18 or v20 recommended)
- npm (comes with Node.js)

### Installation Links:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

---

## 📦 Installation

### 1️⃣ Clone or Download the Project

```powershell
# Navigate to your project directory
cd d:\PROJECTS\ImageDetection\web_app
```

### 2️⃣ Install Backend Dependencies

```powershell
# Navigate to backend folder
cd backend

# Install Python packages
pip install -r requirements.txt
```

**Backend Dependencies:**
- FastAPI - Web framework
- Uvicorn - ASGI server
- Ultralytics - YOLOv8 implementation
- PyTorch - Deep learning framework
- OpenCV - Image processing
- Pillow - Image handling
- NumPy - Numerical operations

### 3️⃣ Install Frontend Dependencies

```powershell
# Navigate to frontend folder (from backend folder)
cd ..\frontend

# Install Node.js packages
npm install
```

**Frontend Dependencies:**
- React - UI framework
- Axios - HTTP client
- React-Webcam - Webcam integration
- Recharts - Data visualization

---

## 🚀 How to Run

### 🎯 Super Quick Start (One-Click)

Simply double-click the **`RUN.bat`** file in the project root!

This will:
- ✅ Check if Python and Node.js are installed
- ✅ Install dependencies automatically (first time only)
- ✅ Start both backend and frontend servers
- ✅ Open the application in your browser

**That's it!** The app will be available at **http://localhost:3000**

---

### 📋 Manual Start (Alternative)

If you prefer to start servers manually:

#### Step 1: Start Backend Server

```powershell
cd backend
python app.py
```

Backend runs on: **http://localhost:8000**

You should see:
```
🛰️  FALCON DETECTION BACKEND
✅ YOLOv8m model loaded successfully!
 Server starting on http://0.0.0.0:8000
```

#### Step 2: Start Frontend (New Terminal)

```powershell
cd frontend
npm start
```

Frontend runs on: **http://localhost:3000**

Your browser will automatically open to the application.

---

### 🛑 How to Stop

- Close the terminal windows, or
- Press `Ctrl+C` in each terminal window

---

## 🎓 Training the Model

### Dataset Information

The model is trained on a custom dataset:
- **Training Images**: 1,769
- **Validation Images**: 338
- **Test Images**: 1,408
- **Total Images**: 3,515
- **Classes**: 7 safety objects

### Training Configuration

The `dataset.yaml` file contains:
```yaml
path: d:\PROJECTS\ImageDetection\web_app
train: train_3/train3/images
val: train_3/val3/images
test: test3/images
nc: 7
names:
  0: Oxygen_Tank
  1: Nitrogen_Tank
  2: First_Aid_Box
  3: Fire_Alarm
  4: Safety_Switch_Panel
  5: Emergency_Phone
  6: Fire_Extinguisher
```

### Training the Model

```powershell
# Run training script
python train_model.py
```

**Training Parameters:**
- **Model**: YOLOv8m (medium)
- **Epochs**: 70-100
- **Batch Size**: 16
- **Image Size**: 640x640
- **Optimizer**: AdamW
- **Learning Rate**: 0.001
- **Target mAP@0.5**: >95%
- **Target FPS**: 20

**Training Features:**
- Mosaic augmentation
- MixUp augmentation
- CLAHE (Contrast Limited Adaptive Histogram Equalization)
- HSV color jittering
- Perspective transformations
- Random erasing

### Training Output

Results are saved in:
```
runs/train/falcon_yolov8m_final/
├── weights/
│   ├── best.pt      # Best performing model
│   └── last.pt      # Latest checkpoint
├── results.csv      # Training metrics
└── args.yaml        # Training configuration
```

---

## 🧪 Testing and Validation

### Check Training Progress

```powershell
python check_training.py
```

This shows:
- Training progress
- Metrics (mAP, precision, recall)
- Loss values

### Test Model Accuracy

```powershell
python test_accuracy.py
```

This performs validation and generates:
- mAP@0.5 and mAP@0.5-0.95
- Precision and recall per class
- Confusion matrix
- Results saved to `frontend/public/test_accuracy_results.json`

### Test Detection on Images

```powershell
python test_detection.py
```

This runs detection on test images and shows:
- Detection results
- Confidence scores
- Bounding boxes

### Quick Model Test

```powershell
python quick_test.py
```

Quick verification that the model is working correctly.

---

## 📡 API Documentation

### Backend API Endpoints

**Base URL**: `http://localhost:8000`

#### 1. Health Check
```http
GET /
```

**Response:**
```json
{
  "status": "online",
  "model": "yolov8m.pt",
  "classes": 7,
  "message": "Falcon Detection API is running!"
}
```

#### 2. Upload Image for Detection
```http
POST /detect
```

**Request:**
- `Content-Type`: `multipart/form-data`
- `file`: Image file (jpg, png, jpeg)

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class": "Fire_Extinguisher",
      "confidence": 0.95,
      "bbox": [100, 150, 200, 300]
    }
  ],
  "count": 1,
  "annotated_image": "base64_encoded_image",
  "processing_time_ms": 45.2
}
```

#### 3. Webcam Frame Detection
```http
POST /detect-frame
```

**Request:**
- `Content-Type`: `application/json`
- Body: `{"image": "base64_encoded_image"}`

**Response:**
```json
{
  "success": true,
  "detections": [...],
  "count": 2,
  "annotated_image": "base64_encoded_image",
  "processing_time_ms": 32.1
}
```

#### 4. Model Statistics
```http
GET /stats
```

**Response:**
```json
{
  "model": "yolov8m.pt",
  "classes": 7,
  "input_size": [640, 640],
  "parameters": "25.9M",
  "device": "cuda"
}
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (modern Python web framework)
- **Server**: Uvicorn (ASGI server)
- **ML Framework**: PyTorch (deep learning)
- **Object Detection**: Ultralytics YOLOv8
- **Image Processing**: OpenCV, Pillow
- **Numerical Operations**: NumPy

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Webcam**: react-webcam
- **Charts**: Recharts
- **Styling**: Custom CSS with modern design

### Model
- **Architecture**: YOLOv8m (You Only Look Once v8 - Medium)
- **Input Size**: 640x640 pixels
- **Parameters**: ~25.9M
- **Format**: PyTorch (.pt)

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Port Already in Use

**Error**: `Address already in use`

**Solution:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use the restart script
.\RESTART_BACKEND.ps1
```

#### 2. Frontend Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution:**
- Press `Y` when prompted to use a different port
- Or kill the process:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 3. Module Not Found Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```powershell
cd backend
pip install -r requirements.txt
```

**Error**: `'react-scripts' is not recognized`

**Solution:**
```powershell
cd frontend
npm install
```

#### 4. CUDA/GPU Issues

**Error**: `CUDA out of memory`

**Solution:**
The app is configured to use CPU by default. If you want to use GPU:

```python
# In backend/app.py, remove or comment out:
# os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
```

#### 5. Model File Not Found

**Error**: `Model file not found: yolov8m.pt`

**Solution:**
- Ensure `yolov8m.pt` is in the `backend/` folder
- If missing, the script will auto-download it on first run
- Or manually download from: https://github.com/ultralytics/assets/releases

#### 6. Webcam Not Working

**Issue**: Webcam detection not starting

**Solution:**
- Grant browser permission to access webcam
- Ensure no other application is using the webcam
- Try a different browser (Chrome recommended)
- Check Windows Privacy Settings > Camera

#### 7. CORS Errors

**Error**: `CORS policy blocked`

**Solution:**
- Ensure backend is running on port 8000
- Check `allow_origins` in `backend/app.py`
- Clear browser cache

#### 8. Slow Detection Speed

**Issue**: Detection is taking too long

**Solution:**
- Use GPU if available (remove CPU-only setting)
- Reduce image resolution
- Use YOLOv8n (nano) instead of YOLOv8m for faster inference
- Close other resource-intensive applications

---

## 📊 Performance Metrics

### Target Performance:
- **mAP@0.5**: >95%
- **Inference Speed**: ~20 FPS
- **Precision**: >90% per class
- **Recall**: >90% per class

### Actual Results:
Check `frontend/public/test_accuracy_results.json` after running `test_accuracy.py` for current model performance.

---

## 📝 Usage Tips

1. **Image Upload Mode**:
   - Use high-quality images for best results
   - Ensure good lighting in images
   - Multiple objects can be detected in one image

2. **Webcam Mode**:
   - Ensure adequate lighting
   - Keep objects in focus
   - Maintain steady camera for accurate detection
   - Objects should be clearly visible

3. **Confidence Threshold**:
   - Default threshold: 0.5 (50%)
   - Higher threshold = fewer but more confident detections
   - Lower threshold = more detections but may include false positives

---

## 🎯 Future Enhancements

- [ ] Multi-language support
- [ ] Mobile application
- [ ] Real-time video file processing
- [ ] Export detection reports (PDF, CSV)
- [ ] Cloud deployment
- [ ] User authentication
- [ ] Detection history database
- [ ] Custom alert configurations
- [ ] Integration with facility management systems

---

## 👥 Team

**Duality AI**  
NASA Space Apps Challenge 2025

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Use ESLint rules for JavaScript/React code
- Write clear commit messages
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Additional test cases
- 🌍 Internationalization (i18n)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Duality AI - NASA Space Apps Challenge 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📬 Contact

**Duality AI Team**

- 🌐 Project Link: [https://github.com/yourusername/falcon-detection](https://github.com/yourusername/falcon-detection)
- 📧 Email: your.email@example.com
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

## 🆘 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the error logs in the terminal
3. Ensure all dependencies are properly installed
4. Verify Python and Node.js versions

---

## 🙏 Acknowledgments

We would like to thank:

- 🚀 **[NASA Space Apps Challenge 2025](https://www.spaceappschallenge.org/)** - For organizing this incredible global hackathon
- 🤖 **[Ultralytics](https://github.com/ultralytics/ultralytics)** - For the powerful YOLOv8 framework and excellent documentation
- 🔥 **[PyTorch](https://pytorch.org/)** - For the robust deep learning framework
- ⚛️ **[React](https://reactjs.org/)** - For the amazing frontend library
- ⚡ **[FastAPI](https://fastapi.tiangolo.com/)** - For the modern, fast web framework
- 📷 **OpenCV Community** - For comprehensive computer vision tools
- 🎨 **Design Inspiration** - Modern space-themed UI/UX communities
- 👥 **Open Source Community** - For continuous support and resources

Special thanks to all contributors and supporters of this project! 🌟

---

## 📊 Project Stats

<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/falcon-detection)
![GitHub stars](https://img.shields.io/github/stars/yourusername/falcon-detection?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/falcon-detection?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/falcon-detection)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/falcon-detection)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/falcon-detection)

</div>

---

## ⭐ Show Your Support

If you found this project helpful or interesting, please consider giving it a ⭐ on GitHub! Your support motivates us to continue improving and maintaining this project.

---

## 🚀 Quick Reference

<div align="center">

### ⚡ Quick Commands

</div>

| Task | Command |
|------|---------|
| **🚀 Run Everything** | **Double-click `RUN.bat`** |
| **Start Backend** | `cd backend && python app.py` |
| **Start Frontend** | `cd frontend && npm start` |
| **Install Backend** | `cd backend && pip install -r requirements.txt` |
| **Install Frontend** | `cd frontend && npm install` |
| **Train Model** | `python train_model.py` |
| **Test Accuracy** | `python test_accuracy.py` |
| **Test Detection** | `python test_detection.py` |
| **Quick Test** | `python quick_test.py` |

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:8000 | REST API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **ReDoc** | http://localhost:8000/redoc | Alternative API documentation |

---

## 🗺️ Roadmap

- [x] YOLOv8 model training and optimization
- [x] FastAPI backend with REST endpoints
- [x] React frontend with modern UI
- [x] Image upload detection
- [x] Real-time webcam detection
- [x] Analytics dashboard
- [x] Detection history tracking
- [ ] User authentication system
- [ ] Database integration (PostgreSQL)
- [ ] Video file processing
- [ ] Export reports (PDF/CSV)
- [ ] Mobile app (React Native)
- [ ] Cloud deployment (AWS/Azure)
- [ ] Multi-language support
- [ ] Advanced analytics with ML insights
- [ ] Custom model training UI
- [ ] Integration with IoT devices

---

## 🔗 Useful Links

- 📚 [YOLOv8 Documentation](https://docs.ultralytics.com/)
- 🎓 [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- ⚛️ [React Documentation](https://react.dev/)
- 🔬 [Computer Vision Resources](https://github.com/jbhuang0604/awesome-computer-vision)
- 🚀 [NASA Space Apps](https://www.spaceappschallenge.org/)

---

<div align="center">

### 🛰️ Built with ❤️ for NASA Space Apps Challenge 2025

**Happy Detecting! 🔍✨**

---

[![Made with Python](https://img.shields.io/badge/Made%20with-Python-1f425f.svg)](https://www.python.org/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb.svg)](https://reactjs.org/)
[![Powered by YOLOv8](https://img.shields.io/badge/Powered%20by-YOLOv8-00FFFF.svg)](https://github.com/ultralytics/ultralytics)

</div>
