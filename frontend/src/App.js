/**
 * 🛰️ Falcon Detection Web App - MODERN EDITION
 * NASA Space Apps Challenge 2025 - Duality AI
 * 
 * Main App Component with Advanced UI
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CLASS_COLORS = [
  '#FF6B6B', // Oxygen Tank - Red
  '#4ECDC4', // Nitrogen Tank - Cyan
  '#45B7D1', // First Aid Box - Blue
  '#FFA07A', // Fire Alarm - Light Salmon
  '#98D8C8', // Safety Switch Panel - Mint
  '#F7DC6F', // Emergency Phone - Yellow
  '#E74C3C', // Fire Extinguisher - Dark Red
];

const CLASS_NAMES = [
  { emoji: '🔴', name: 'Oxygen Tank', key: 'Oxygen_Tank' },
  { emoji: '💧', name: 'Nitrogen Tank', key: 'Nitrogen_Tank' },
  { emoji: '🏥', name: 'First Aid Box', key: 'First_Aid_Box' },
  { emoji: '🚨', name: 'Fire Alarm', key: 'Fire_Alarm' },
  { emoji: '⚡', name: 'Safety Switch Panel', key: 'Safety_Switch_Panel' },
  { emoji: '📞', name: 'Emergency Phone', key: 'Emergency_Phone' },
  { emoji: '🧯', name: 'Fire Extinguisher', key: 'Fire_Extinguisher' }
];

function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'upload', 'webcam', 'analytics'
  const [selectedImage, setSelectedImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [stats, setStats] = useState(null);
  const [fps, setFps] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [objectCounts, setObjectCounts] = useState({});
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [alertMode, setAlertMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState('');
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const detectionInterval = useRef(null);
  const fpsInterval = useRef(null);
  const frameCount = useRef(0);
  const lastDetectionCount = useRef({});
  const voiceAnnouncementTimeout = useRef(null);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
    loadModelAccuracy();
  }, []);

  const loadModelAccuracy = async () => {
    try {
      const response = await fetch('/test_accuracy_results.json');
      if (response.ok) {
        const data = await response.json();
        setModelAccuracy(data);
      }
    } catch (error) {
      console.log('Accuracy data not available');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Voice announcement function
  const announceDetections = useCallback((detections) => {
    if (!voiceEnabled || detections.length === 0) return;

    // Count objects by class
    const objectCounts = {};
    detections.forEach(det => {
      const className = formatObjectName(det.class);
      objectCounts[className] = (objectCounts[className] || 0) + 1;
    });

    // Check if detection counts changed significantly
    const hasChanged = Object.keys(objectCounts).some(key => 
      lastDetectionCount.current[key] !== objectCounts[key]
    );

    if (!hasChanged && Object.keys(lastDetectionCount.current).length > 0) return;

    lastDetectionCount.current = objectCounts;

    // Clear previous timeout
    if (voiceAnnouncementTimeout.current) {
      clearTimeout(voiceAnnouncementTimeout.current);
    }

    // Debounce announcements (wait 2 seconds after detection stabilizes)
    voiceAnnouncementTimeout.current = setTimeout(() => {
      const totalObjects = detections.length;
      const uniqueObjects = Object.keys(objectCounts).length;

      // Build announcement text
      let announcement = `Detected ${totalObjects} object${totalObjects > 1 ? 's' : ''}. `;
      
      if (uniqueObjects <= 5) {
        // Announce each object type with quantity
        const objectList = Object.entries(objectCounts)
          .map(([name, count]) => {
            if (count === 1) {
              return `${name}`;
            } else {
              return `${count} ${name}${name.endsWith('s') ? '' : 's'}`;
            }
          })
          .join(', ');
        announcement += objectList;
      } else {
        // Too many types, just announce total
        announcement += `${uniqueObjects} different types of objects`;
      }

      setLastAnnouncement(announcement);

      // Use Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }, 2000); // Wait 2 seconds for detections to stabilize
  }, [voiceEnabled]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setLoading(true);
    setDetections([]);
    setAnnotatedImage(null);
    
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/predict/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const endTime = Date.now();
      setProcessingTime(endTime - startTime);
      
      setDetections(response.data.detections);
      setAnnotatedImage(response.data.image.annotated);
      
      // Announce detections via voice
      announceDetections(response.data.detections);
      
      // Add to detection history
      setDetectionHistory(prev => [{
        timestamp: new Date().toISOString(),
        count: response.data.detections.length,
        avgConfidence: response.data.detections.reduce((sum, d) => sum + d.confidence, 0) / response.data.detections.length,
        objects: response.data.detections.map(d => formatObjectName(d.class))
      }, ...prev.slice(0, 9)]);
      
      fetchStats();
    } catch (error) {
      console.error('Error detecting objects:', error);
      alert('Detection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const drawBoundingBoxes = useCallback((detections) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, idx) => {
      const { bbox, class: className, confidence } = detection;
      const color = CLASS_COLORS[detection.class_id % CLASS_COLORS.length];
      const emoji = getObjectEmoji(className);

      // Draw bounding box with thicker line
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

      // Create label with emoji and formatted name
      const formattedName = className.replace(/_/g, ' ');
      const label = `${emoji} ${formattedName} ${(confidence * 100).toFixed(1)}%`;
      
      // Set font and measure text
      ctx.font = 'bold 18px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 24;
      const padding = 8;

      // Draw label background with rounded effect
      ctx.fillStyle = color;
      ctx.fillRect(bbox.x1, bbox.y1 - textHeight - padding, textMetrics.width + padding * 2, textHeight + padding);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'top';
      ctx.fillText(label, bbox.x1 + padding, bbox.y1 - textHeight - padding + 4);
      ctx.fillText(label, bbox.x1 + 5, bbox.y1 - 8);
    });
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (!webcamRef.current || !isDetecting) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    frameCount.current++;

    try {
      const response = await axios.post(`${API_URL}/predict/base64`, {
        image: imageSrc
      });

      setDetections(response.data.detections);
      drawBoundingBoxes(response.data.detections);
      
      // Announce detections via voice
      announceDetections(response.data.detections);
    } catch (error) {
      console.error('Webcam detection error:', error);
    }
  }, [isDetecting, drawBoundingBoxes, announceDetections]);

  const startDetection = () => {
    setIsDetecting(true);
    frameCount.current = 0;
    
    detectionInterval.current = setInterval(captureAndDetect, 200); // 5 FPS
    fpsInterval.current = setInterval(() => {
      setFps(Math.round(frameCount.current / 1));
      frameCount.current = 0;
    }, 1000);
  };

  const stopDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    if (fpsInterval.current) {
      clearInterval(fpsInterval.current);
      fpsInterval.current = null;
    }
    setIsDetecting(false);
    setDetections([]);
    setFps(0);
    frameCount.current = 0;
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      mode: activeTab,
      num_detections: detections.length,
      detections: detections.map(d => ({
        object: formatObjectName(d.class),
        confidence: `${(d.confidence * 100).toFixed(2)}%`,
        bbox: d.bbox
      })),
      project: "NASA Space Apps Challenge 2025 - Falcon Detection",
      team: "Duality AI"
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `falcon_detection_report_${Date.now()}.json`;
    a.click();
  };

  const downloadCSV = () => {
    const headers = ['Object', 'Confidence', 'X1', 'Y1', 'X2', 'Y2'];
    const rows = detections.map(d => [
      formatObjectName(d.class),
      (d.confidence * 100).toFixed(2) + '%',
      d.bbox.x1.toFixed(0),
      d.bbox.y1.toFixed(0),
      d.bbox.x2.toFixed(0),
      d.bbox.y2.toFixed(0)
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `falcon_detections_${Date.now()}.csv`;
    a.click();
  };

  const downloadAnnotatedImage = () => {
    if (annotatedImage) {
      const a = document.createElement('a');
      a.href = annotatedImage;
      a.download = `falcon_annotated_${Date.now()}.jpg`;
      a.click();
    } else if (canvasRef.current && isDetecting) {
      // For webcam mode
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;
      if (!video) return;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      
      // Draw video frame
      ctx.drawImage(video, 0, 0);
      
      // Draw detections
      detections.forEach((detection) => {
        const { bbox, class: className, confidence } = detection;
        const color = CLASS_COLORS[detection.class_id % CLASS_COLORS.length];

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

        const label = `${className}: ${(confidence * 100).toFixed(1)}%`;
        ctx.font = 'bold 16px Arial';
        const textMetrics = ctx.measureText(label);
        const textHeight = 20;

        ctx.fillStyle = color;
        ctx.fillRect(bbox.x1, bbox.y1 - textHeight - 5, textMetrics.width + 10, textHeight + 5);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, bbox.x1 + 5, bbox.y1 - 8);
      });
      
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `falcon_webcam_${Date.now()}.jpg`;
        a.click();
      });
    }
  };

  // Calculate object counts and update state
  useEffect(() => {
    const counts = {};
    let totalConfidence = 0;
    
    detections.forEach(d => {
      const className = d.class;
      counts[className] = (counts[className] || 0) + 1;
      totalConfidence += d.confidence;
    });
    
    setObjectCounts(counts);
    setAvgConfidence(detections.length > 0 ? totalConfidence / detections.length : 0);
  }, [detections]);

  const formatObjectName = (className) => {
    const nameMap = {
      'Oxygen_Tank': 'Oxygen Tank',
      'Nitrogen_Tank': 'Nitrogen Tank',
      'First_Aid_Box': 'First Aid Box',
      'Fire_Alarm': 'Fire Alarm',
      'Safety_Switch_Panel': 'Safety Switch Panel',
      'Emergency_Phone': 'Emergency Phone',
      'Fire_Extinguisher': 'Fire Extinguisher'
    };
    return nameMap[className] || className.replace(/_/g, ' ');
  };

  const getObjectEmoji = (className) => {
    const emojiMap = {
      'Oxygen Tank': '🔴',
      'Oxygen_Tank': '🔴',
      'Nitrogen Tank': '💧',
      'Nitrogen_Tank': '💧',
      'First Aid Box': '🏥',
      'First_Aid_Box': '🏥',
      'Fire Alarm': '🚨',
      'Fire_Alarm': '🚨',
      'Safety Switch Panel': '⚡',
      'Safety_Switch_Panel': '⚡',
      'Emergency Phone': '📞',
      'Emergency_Phone': '📞',
      'Fire Extinguisher': '🧯',
      'Fire_Extinguisher': '🧯'
    };
    return emojiMap[className] || '🎯';
  };

  const getTotalDetections = () => detections.length;

  const getHighestConfidence = () => {
    if (detections.length === 0) return 0;
    return Math.max(...detections.map(d => d.confidence));
  };

  const getLowestConfidence = () => {
    if (detections.length === 0) return 0;
    return Math.min(...detections.map(d => d.confidence));
  };

  return (
    <div className="App">
      {/* Ultra Modern Header */}
      <header className="app-header-ultra">
        <div className="header-particles"></div>
        <div className="header-content-ultra">
          <div className="logo-section-ultra">
            <div className="logo-container">
              <div className="logo-icon-ultra">🛰️</div>
              <div className="logo-pulse"></div>
            </div>
            <div className="logo-text-ultra">
              <h1 className="logo-title">FALCON AI</h1>
              <p className="logo-subtitle">Space Safety Detection System</p>
            </div>
          </div>
          
          <div className="header-actions">
            {modelAccuracy && (
              <div className="accuracy-badge-ultra" onClick={() => setShowAccuracy(!showAccuracy)}>
                <div className="badge-shimmer"></div>
                <span className="badge-icon-ultra">🏆</span>
                <div className="badge-content">
                  <span className="badge-value">{(modelAccuracy.overall_metrics.mAP50 * 100).toFixed(1)}%</span>
                  <span className="badge-label">Accuracy</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Accuracy Modal */}
      {showAccuracy && modelAccuracy && (
        <div className="modal-overlay" onClick={() => setShowAccuracy(false)}>
          <div className="accuracy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏆 Model Performance Metrics</h2>
              <button className="close-btn" onClick={() => setShowAccuracy(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="accuracy-grid">
                <div className="accuracy-card">
                  <div className="accuracy-value">{(modelAccuracy.overall_metrics.mAP50 * 100).toFixed(2)}%</div>
                  <div className="accuracy-label">mAP@50</div>
                </div>
                <div className="accuracy-card">
                  <div className="accuracy-value">{(modelAccuracy.overall_metrics.mAP50_95 * 100).toFixed(2)}%</div>
                  <div className="accuracy-label">mAP@50-95</div>
                </div>
                <div className="accuracy-card">
                  <div className="accuracy-value">{(modelAccuracy.overall_metrics.precision * 100).toFixed(2)}%</div>
                  <div className="accuracy-label">Precision</div>
                </div>
                <div className="accuracy-card">
                  <div className="accuracy-value">{(modelAccuracy.overall_metrics.recall * 100).toFixed(2)}%</div>
                  <div className="accuracy-label">Recall</div>
                </div>
              </div>
              <div className="per-class-metrics">
                <h3>Per-Class Performance</h3>
                {Object.entries(modelAccuracy.per_class_metrics).map(([className, metrics]) => (
                  <div key={className} className="class-metric-row">
                    <span className="class-name">{getObjectEmoji(className)} {formatObjectName(className)}</span>
                    <div className="metric-bars">
                      <div className="metric-bar">
                        <span className="bar-label">P</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${metrics.precision * 100}%`, background: '#4ECDC4' }}></div>
                        </div>
                        <span className="bar-value">{(metrics.precision * 100).toFixed(1)}%</span>
                      </div>
                      <div className="metric-bar">
                        <span className="bar-label">R</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${metrics.recall * 100}%`, background: '#FF6B6B' }}></div>
                        </div>
                        <span className="bar-value">{(metrics.recall * 100).toFixed(1)}%</span>
                      </div>
                      <div className="metric-bar">
                        <span className="bar-label">mAP</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${metrics.mAP50 * 100}%`, background: '#F7DC6F' }}></div>
                        </div>
                        <span className="bar-value">{(metrics.mAP50 * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Metrics Dashboard */}
      {detections.length > 0 && activeTab !== 'home' && activeTab !== 'analytics' && (
        <div className="metrics-dashboard">
          <div className="metric-card total">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <span className="metric-value">{getTotalDetections()}</span>
              <span className="metric-label">Total Objects</span>
            </div>
          </div>
          
          <div className="metric-card accuracy">
            <div className="metric-icon">✨</div>
            <div className="metric-content">
              <span className="metric-value">{(avgConfidence * 100).toFixed(1)}%</span>
              <span className="metric-label">Avg Confidence</span>
            </div>
          </div>
          
          <div className="metric-card high">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <span className="metric-value">{(getHighestConfidence() * 100).toFixed(1)}%</span>
              <span className="metric-label">Highest</span>
            </div>
          </div>
          
          <div className="metric-card low">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <span className="metric-value">{(getLowestConfidence() * 100).toFixed(1)}%</span>
              <span className="metric-label">Lowest</span>
            </div>
          </div>
          
          {processingTime > 0 && (
            <div className="metric-card time">
              <div className="metric-icon">⚡</div>
              <div className="metric-content">
                <span className="metric-value">{processingTime}ms</span>
                <span className="metric-label">Processing</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ultra Modern Tab Navigation */}
      <div className="tab-navigation-ultra">
        <div className="tab-container">
          <button
            className={`tab-btn-ultra ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="tab-icon-ultra">🏠</span>
            <span className="tab-text-ultra">Home</span>
            {activeTab === 'home' && <div className="tab-glow"></div>}
          </button>
          <button
            className={`tab-btn-ultra ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="tab-icon-ultra">�</span>
            <span className="tab-text-ultra">Detect</span>
            {activeTab === 'upload' && <div className="tab-glow"></div>}
          </button>
          <button
            className={`tab-btn-ultra ${activeTab === 'webcam' ? 'active' : ''}`}
            onClick={() => setActiveTab('webcam')}
          >
            <span className="tab-icon-ultra">📹</span>
            <span className="tab-text-ultra">Live</span>
            {activeTab === 'webcam' && <div className="tab-glow"></div>}
          </button>
          <button
            className={`tab-btn-ultra ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="tab-icon-ultra">📊</span>
            <span className="tab-text-ultra">Analytics</span>
            {activeTab === 'analytics' && <div className="tab-glow"></div>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-wrapper-modern">
        {activeTab === 'home' ? (
          /* Home Page */
          <div className="home-section">
            <div className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  <span className="hero-icon">🛰️</span>
                  FALCON AI Detection System
                </h1>
                <p className="hero-subtitle">
                  Advanced YOLOv8m-powered object detection for space station safety equipment
                </p>
                <div className="hero-stats-grid">
                  <div className="hero-stat">
                    <div className="hero-stat-value">7</div>
                    <div className="hero-stat-label">Safety Objects</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-value">{modelAccuracy ? (modelAccuracy.overall_metrics.mAP50 * 100).toFixed(1) : '74.6'}%</div>
                    <div className="hero-stat-label">Model Accuracy</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-value">25.8M</div>
                    <div className="hero-stat-label">Parameters</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-value">Real-time</div>
                    <div className="hero-stat-label">Detection</div>
                  </div>
                </div>
                <div className="hero-actions">
                  <button className="hero-btn primary" onClick={() => setActiveTab('upload')}>
                    <span>📸</span> Try Detection
                  </button>
                  <button className="hero-btn secondary" onClick={() => setActiveTab('analytics')}>
                    <span>📊</span> View Analytics
                  </button>
                </div>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>High Precision</h3>
                <p>84.6% precision with advanced YOLOv8m architecture</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Real-time Detection</h3>
                <p>Process images in milliseconds with GPU acceleration</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📹</div>
                <h3>Live Webcam</h3>
                <p>Real-time detection with live camera feed</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Analytics Dashboard</h3>
                <p>Comprehensive metrics and detection history</p>
              </div>
            </div>

            <div className="objects-showcase">
              <h2 className="showcase-title">Detectable Safety Objects</h2>
              <div className="objects-grid">
                {CLASS_NAMES.map((obj, idx) => (
                  <div key={idx} className="object-showcase-card" style={{ borderColor: CLASS_COLORS[idx] }}>
                    <div className="object-showcase-emoji">{obj.emoji}</div>
                    <div className="object-showcase-name">{obj.name}</div>
                    {modelAccuracy && modelAccuracy.per_class_metrics[obj.key] && (
                      <div className="object-showcase-accuracy">
                        {(modelAccuracy.per_class_metrics[obj.key].mAP50 * 100).toFixed(1)}% mAP
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'upload' ? (
          /* Upload Mode */
          <div className="upload-section-modern">
            <div className="detection-panel">
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                {!selectedImage ? (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📸</div>
                    <h3>Drop your image here</h3>
                    <p>or click to browse</p>
                    <div className="upload-formats">
                      <span>JPG</span>
                      <span>PNG</span>
                      <span>JPEG</span>
                    </div>
                  </div>
                ) : (
                  <div className="image-container-modern">
                    {loading && (
                      <div className="loading-overlay">
                        <div className="loader-modern"></div>
                        <p>Analyzing image...</p>
                      </div>
                    )}
                    <img 
                      src={annotatedImage || selectedImage} 
                      alt="Detection" 
                      className="detected-image-modern"
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="upload-controls-container">
                <button
                  className={`control-btn-modern ${voiceEnabled ? 'btn-voice-active' : 'btn-voice'}`}
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  title={voiceEnabled ? 'Disable Voice Announcements' : 'Enable Voice Announcements'}
                  style={{ marginBottom: '1rem' }}
                >
                  <span className="control-icon">{voiceEnabled ? '🔊' : '🔇'}</span>
                  <span className="control-text">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                </button>
                
                {lastAnnouncement && voiceEnabled && (
                  <div className="voice-announcement-display">
                    <span className="voice-icon">🎙️</span>
                    <span className="voice-text">{lastAnnouncement}</span>
                  </div>
                )}
              </div>

              {detections.length > 0 && (
                <div className="action-buttons-modern">
                  <button className="btn-modern btn-json" onClick={downloadReport}>
                    <span className="btn-icon">📄</span>
                    JSON
                  </button>
                  <button className="btn-modern btn-csv" onClick={downloadCSV}>
                    <span className="btn-icon">📊</span>
                    CSV
                  </button>
                  <button className="btn-modern btn-image" onClick={downloadAnnotatedImage}>
                    <span className="btn-icon">🖼️</span>
                    Image
                  </button>
                </div>
              )}
            </div>

            {detections.length > 0 && (
              <div className="results-panel-modern">
                <h3 className="panel-title">
                  <span className="title-icon">📊</span>
                  Detection Results
                </h3>
                
                {/* Object Count Grid */}
                <div className="count-grid">
                  {CLASS_NAMES.map((obj, idx) => {
                    const count = objectCounts[obj.key] || 0;
                    if (count === 0) return null;
                    return (
                      <div key={idx} className="count-card" style={{
                        borderLeft: `4px solid ${CLASS_COLORS[idx]}`
                      }}>
                        <div className="count-emoji">{obj.emoji}</div>
                        <div className="count-info">
                          <span className="count-name">{obj.name}</span>
                          <span className="count-number">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Detection List */}
                <div className="detection-list-modern">
                  {detections.map((detection, idx) => {
                    const emoji = getObjectEmoji(detection.class);
                    const className = formatObjectName(detection.class);
                    const color = CLASS_COLORS[detection.class_id % CLASS_COLORS.length];
                    
                    return (
                      <div key={idx} className="detection-card-modern" style={{
                        borderLeft: `4px solid ${color}`
                      }}>
                        <div className="detection-header-modern">
                          <span className="detection-emoji-modern">{emoji}</span>
                          <span className="detection-name-modern">{className}</span>
                          <span className="detection-confidence" style={{
                            background: `linear-gradient(135deg, ${color}40, ${color}20)`,
                            color: color
                          }}>
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="detection-details-modern">
                          <div className="detail-item">
                            <span className="detail-label">Position:</span>
                            <span className="detail-value">
                              ({detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)})
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Size:</span>
                            <span className="detail-value">
                              {(detection.bbox.x2 - detection.bbox.x1).toFixed(0)} × {(detection.bbox.y2 - detection.bbox.y1).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'webcam' ? (
          /* Webcam Mode */
          <div className="webcam-section-modern">
            <div className="webcam-panel">
              <div className="webcam-container-modern">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="webcam-modern"
                />
                <canvas ref={canvasRef} className="canvas-overlay-modern" />
                
                {isDetecting && (
                  <div className="webcam-indicators">
                    <div className="live-badge">
                      <span className="live-dot"></span>
                      LIVE
                    </div>
                    <div className="fps-counter">{fps} FPS</div>
                  </div>
                )}
              </div>

              <div className="webcam-controls-modern">
                <button
                  className={`control-btn-modern ${isDetecting ? 'btn-stop' : 'btn-start'}`}
                  onClick={isDetecting ? stopDetection : startDetection}
                >
                  <span className="control-icon">{isDetecting ? '⏹️' : '▶️'}</span>
                  <span className="control-text">{isDetecting ? 'Stop Detection' : 'Start Detection'}</span>
                </button>
                
                <button
                  className={`control-btn-modern ${voiceEnabled ? 'btn-voice-active' : 'btn-voice'}`}
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  title={voiceEnabled ? 'Disable Voice Announcements' : 'Enable Voice Announcements'}
                >
                  <span className="control-icon">{voiceEnabled ? '🔊' : '🔇'}</span>
                  <span className="control-text">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                </button>
              </div>
              
              {lastAnnouncement && voiceEnabled && (
                <div className="voice-announcement-display">
                  <span className="voice-icon">🎙️</span>
                  <span className="voice-text">{lastAnnouncement}</span>
                </div>
              )}
            </div>

            {detections.length > 0 && (
              <div className="results-panel-modern webcam-results">
                <h3 className="panel-title">
                  <span className="title-icon">📡</span>
                  Live Detections
                </h3>
                
                {/* Object Count Grid */}
                <div className="count-grid">
                  {CLASS_NAMES.map((obj, idx) => {
                    const count = objectCounts[obj.key] || 0;
                    if (count === 0) return null;
                    return (
                      <div key={idx} className="count-card" style={{
                        borderLeft: `4px solid ${CLASS_COLORS[idx]}`
                      }}>
                        <div className="count-emoji">{obj.emoji}</div>
                        <div className="count-info">
                          <span className="count-name">{obj.name}</span>
                          <span className="count-number">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="quick-label">Objects:</span>
                    <span className="quick-value">{detections.length}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-label">Avg Confidence:</span>
                    <span className="quick-value">{(avgConfidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Analytics Dashboard */
          <div className="analytics-section">
            <div className="analytics-header">
              <h2>📊 Analytics Dashboard</h2>
              <p>Comprehensive detection statistics and performance metrics</p>
            </div>

            <div className="analytics-grid">
              {/* Model Performance Card */}
              {modelAccuracy && (
                <div className="analytics-card full-width">
                  <h3>🎯 Model Performance</h3>
                  <div className="performance-grid">
                    <div className="perf-metric">
                      <div className="perf-icon">📈</div>
                      <div className="perf-details">
                        <div className="perf-value">{(modelAccuracy.overall_metrics.mAP50 * 100).toFixed(2)}%</div>
                        <div className="perf-label">mAP@50</div>
                      </div>
                    </div>
                    <div className="perf-metric">
                      <div className="perf-icon">🎯</div>
                      <div className="perf-details">
                        <div className="perf-value">{(modelAccuracy.overall_metrics.precision * 100).toFixed(2)}%</div>
                        <div className="perf-label">Precision</div>
                      </div>
                    </div>
                    <div className="perf-metric">
                      <div className="perf-icon">📊</div>
                      <div className="perf-details">
                        <div className="perf-value">{(modelAccuracy.overall_metrics.recall * 100).toFixed(2)}%</div>
                        <div className="perf-label">Recall</div>
                      </div>
                    </div>
                    <div className="perf-metric">
                      <div className="perf-icon">⚡</div>
                      <div className="perf-details">
                        <div className="perf-value">{(modelAccuracy.overall_metrics.f1_score * 100).toFixed(2)}%</div>
                        <div className="perf-label">F1 Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detection History */}
              {detectionHistory.length > 0 && (
                <div className="analytics-card">
                  <h3>🕐 Recent Detections</h3>
                  <div className="history-list">
                    {detectionHistory.map((item, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-time">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="history-details">
                          <span className="history-count">{item.count} objects</span>
                          <span className="history-confidence">{(item.avgConfidence * 100).toFixed(1)}% avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class Distribution */}
              <div className="analytics-card">
                <h3>📦 Object Distribution</h3>
                <div className="distribution-chart">
                  {CLASS_NAMES.map((obj, idx) => {
                    const count = objectCounts[obj.key] || 0;
                    const total = Object.values(objectCounts).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={idx} className="distribution-row">
                        <div className="dist-label">
                          <span className="dist-emoji">{obj.emoji}</span>
                          <span className="dist-name">{obj.name}</span>
                        </div>
                        <div className="dist-bar-container">
                          <div 
                            className="dist-bar" 
                            style={{ 
                              width: `${percentage}%`,
                              background: CLASS_COLORS[idx]
                            }}
                          ></div>
                        </div>
                        <div className="dist-value">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Info */}
              <div className="analytics-card">
                <h3>⚙️ System Information</h3>
                <div className="system-info">
                  <div className="info-row">
                    <span className="info-label">Model:</span>
                    <span className="info-value">YOLOv8m</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Parameters:</span>
                    <span className="info-value">25.8M</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Device:</span>
                    <span className="info-value">{modelAccuracy?.device || 'CUDA'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Classes:</span>
                    <span className="info-value">7</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Test Images:</span>
                    <span className="info-value">1,408</span>
                  </div>
                  {processingTime > 0 && (
                    <div className="info-row">
                      <span className="info-label">Last Processing:</span>
                      <span className="info-value">{processingTime}ms</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Footer */}
      <footer className="app-footer-modern">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🛰️</span>
            <span className="footer-text">FALCON AI</span>
          </div>
          <div className="footer-info">
            <p>NASA Space Apps Challenge 2025 | Team Duality AI</p>
            <p>Powered by YOLOv8m Deep Learning | 74.6% mAP Accuracy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

