const exp = require('express');
const Tesseract = require("tesseract.js");
const Pothole = require('../models/Pothole');
const User = require('../models/User');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { checkAndUnlockAchievements, getRewardPointsForSeverity } = require('../utils/rewards');

const router = exp.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for completion images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'completion-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Location-based assignment function
const assignMunicipalityUser = async (latitude, longitude) => {
  try {
    const municipalityUsers = await User.find({ role: 'municipality', isActive: true });
    
    if (municipalityUsers.length === 0) return null;
    
    // For now, assign to first available user
    // In production, implement proper distance calculation
    return municipalityUsers[0]._id;
  } catch (error) {
    return null;
  }
};

// Node.js-based Roboflow detection (no Python required)
const detectPotholeWithRoboflowAPI = async (base64Image) => {
  try {
    const apiKey = process.env.ROBOFLOW_API_KEY;
    const modelId = process.env.ROBOFLOW_MODEL_ID || 'pothole-detection-bqu6s-dwjbo';
    const version = process.env.ROBOFLOW_VERSION || '1';
    
    if (!apiKey) {
      throw new Error('ROBOFLOW_API_KEY not configured in environment');
    }
    
    // Remove data:image/... prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Roboflow inference endpoint
    const url = `https://detect.roboflow.com/${modelId}/${version}?api_key=${apiKey}&confidence=30`;
    
    // Send POST request with base64 image
    const response = await axios.post(url, cleanBase64, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000 // 30 second timeout
    });
    
    const data = response.data;
    
    // Check if any potholes detected
    const predictions = data.predictions || [];
    const totalDetections = predictions.length;
    
    if (totalDetections === 0) {
      return {
        success: true,
        isValidPothole: false,
        detectionConfidence: 0,
        width: null,
        height: null,
        message: "No pothole detected in this image. Please upload a clear image showing a pothole.",
        predictions: [],
        totalDetections: 0
      };
    }
    
    // Get highest confidence detection
    const bestDetection = predictions.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );
    
    // Roboflow returns confidence as decimal (0-1), keep it that way for DB
    const confidence = bestDetection.confidence; // e.g., 0.88
    const confidencePercent = Math.round(confidence * 100); // e.g., 88
    
    // Roboflow returns bounding box dimensions
    const width = bestDetection.width ? Math.round(bestDetection.width) : null;
    const height = bestDetection.height ? Math.round(bestDetection.height) : null;
    
    // Determine severity based on dimensions (if available)
    let suggestedSeverity = 'medium';
    if (width && height) {
      const area = width * height;
      if (area > 10000) suggestedSeverity = 'high';
      else if (area < 5000) suggestedSeverity = 'low';
    }
    
    return {
      success: true,
      isValidPothole: confidence >= 0.30, // Minimum 30% confidence (0.30 decimal)
      detectionConfidence: confidence, // Store as decimal (0-1) for DB
      confidencePercent: confidencePercent, // For display purposes
      width,
      height,
      suggestedSeverity,
      predictions,
      totalDetections,
      message: confidence >= 0.30 
        ? `Pothole detected with ${confidencePercent}% confidence` 
        : `Low confidence (${confidencePercent}%). Please upload a clearer image.`
    };
    
  } catch (error) {
    console.error('Roboflow API error:', error.message);

    // Roboflow may return its message as `error`, `error.message`, or
    // `message`. Preserve that safe upstream detail for the UI and logs.
    const upstreamData = error.response?.data;
    const upstreamMessage =
      upstreamData?.error?.message ||
      upstreamData?.error ||
      upstreamData?.message ||
      error.message;
    const status = error.response?.status;

    throw new Error(
      status
        ? `Roboflow rejected the request (${status}): ${upstreamMessage}`
        : `Roboflow request failed: ${upstreamMessage}`
    );
  }
};

// OCR-based GPS extraction from image overlay text
router.post('/extract-gps-ocr', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: "Image (base64) is required" 
      });
    }

    // Run OCR on the image
    const { data: { text } } = await Tesseract.recognize(image, "eng");

    // Try to find GPS coordinates in various formats
    // Format 1: "Lat: 17.5287 Long: 78.3658" or "Lat 17.5287TOP Long 78.3658"
    const pattern1 = /(?:Lat|Latitude)[:\s]*([0-9.]+).*?(?:Long|Longitude)[:\s]*([0-9.]+)/i;
    const match1 = text.match(pattern1);

    if (match1) {
      const latitude = parseFloat(match1[1]);
      const longitude = parseFloat(match1[2]);

      if (!isNaN(latitude) && !isNaN(longitude) && 
          latitude >= -90 && latitude <= 90 && 
          longitude >= -180 && longitude <= 180) {
        return res.json({
          success: true,
          latitude,
          longitude,
          method: 'OCR overlay extraction'
        });
      }
    }

    // Format 2: Simple decimal coordinates "17.5287, 78.3658"
    const pattern2 = /(-?\d{1,3}\.\d{3,})[,\s]+(-?\d{1,3}\.\d{3,})/;
    const match2 = text.match(pattern2);

    if (match2) {
      const latitude = parseFloat(match2[1]);
      const longitude = parseFloat(match2[2]);

      if (!isNaN(latitude) && !isNaN(longitude) && 
          latitude >= -90 && latitude <= 90 && 
          longitude >= -180 && longitude <= 180) {
        return res.json({
          success: true,
          latitude,
          longitude,
          method: 'OCR coordinate extraction'
        });
      }
    }

    res.json({
      success: false,
      latitude: null,
      longitude: null,
      message: 'No GPS coordinates found in image text'
    });

  } catch (err) {
    res.json({ 
      success: false,
      latitude: null,
      longitude: null,
      error: 'OCR extraction failed',
      message: err.message
    });
  }
});

// Detection-only endpoint (for validation before upload)
router.post('/detect-pothole', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: "Image (base64) is required" 
      });
    }
    
    // Run Roboflow detection via API (Node.js - no Python required)
    try {
      const detectionResult = await detectPotholeWithRoboflowAPI(image);
      
      // Return actual detection result
      res.json(detectionResult);
    } catch (detectionError) {
      // If AI detection service fails, return error (strict mode)
      res.status(500).json({
        success: false,
        isValidPothole: false,
        detectionConfidence: 0,
        width: null,
        height: null,
        error: 'Detection service error',
        message: detectionError.message,
        note: 'Please try again or contact support if the issue persists'
      });
    }
  } catch (err) {
    console.error('Detection endpoint error:', err.message);
    res.status(500).json({ 
      success: false,
      isValidPothole: false,
      detectionConfidence: 0,
      error: 'Server error',
      message: err.message
    });
  }
});

// Upload route with Roboflow validation and location-based assignment
router.post('/upload', async (req, res) => {
  try {
    const { submittedBy, location, description, severity, image, latitude, longitude } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image (base64) is required" });
    }

    // Step 1: Run Roboflow detection to validate image (Node.js API)
    let detectionResult;
    try {
      detectionResult = await detectPotholeWithRoboflowAPI(image);
      
      // STRICT VALIDATION: Reject if AI says it's not a pothole
      if (!detectionResult.isValidPothole) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid image",
          message: detectionResult.message || "This image does not contain a pothole. Please upload a valid pothole image.",
          isValidPothole: false,
          detectionConfidence: detectionResult.detectionConfidence
        });
      }
    } catch (detectionError) {
      // If detection SERVICE fails completely, reject upload (strict mode)
      return res.status(500).json({
        success: false,
        error: "Detection service unavailable",
        message: "Unable to validate image. Please try again later.",
        details: detectionError.message
      });
    }

    // Step 2: Run OCR for location extraction (optional)
    let potholeLat = latitude || null;
    let potholeLon = longitude || null;

    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng");
      
      // Regex to find lat/lon
      const latMatch = text.match(/(-?\d{1,2}\.\d{3,})/g);
      const lonMatch = text.match(/(-?\d{2,3}\.\d{3,})/g);

      if (latMatch && lonMatch && !potholeLat && !potholeLon) {
        potholeLat = parseFloat(latMatch[0]);
        potholeLon = parseFloat(lonMatch[1]);
      }
    } catch (ocrError) {
      console.error('OCR error:', ocrError.message);
    }

    // Step 3: Assign municipality user based on location
    const assignedTo = await assignMunicipalityUser(potholeLat, potholeLon);

    // Step 4: Check for duplicate pothole reports in the same location (within 50 meters)
    if (potholeLat && potholeLon) {
      const DUPLICATE_RADIUS = 0.0005; // ~50 meters in degrees (approximate)
      
      const existingPothole = await Pothole.findOne({
        latitude: {
          $gte: potholeLat - DUPLICATE_RADIUS,
          $lte: potholeLat + DUPLICATE_RADIUS
        },
        longitude: {
          $gte: potholeLon - DUPLICATE_RADIUS,
          $lte: potholeLon + DUPLICATE_RADIUS
        },
        status: { $ne: 'completed' } // Only check non-completed potholes
      });

      if (existingPothole) {
        return res.status(400).json({
          success: false,
          error: "Duplicate report",
          message: "A pothole has already been reported at this location. Please check the map for existing reports.",
          existingReport: {
            id: existingPothole._id,
            location: existingPothole.location,
            status: existingPothole.status,
            reportedDate: existingPothole.createdAt
          }
        });
      }
    }

    // Step 5: Use detection-based severity if available, otherwise use user input
    const finalSeverity = detectionResult.suggestedSeverity || severity;
    
    // Calculate reward points based on severity
    const rewardPoints = getRewardPointsForSeverity(finalSeverity);

    // Step 6: Save to MongoDB with detection data
    const newPothole = new Pothole({
      submittedBy,
      image,
      location,
      description,
      severity: finalSeverity,
      latitude: potholeLat,
      longitude: potholeLon,
      assignedTo,
      status: 'reported',
      assignedDate: assignedTo ? new Date() : null,
      municipalityArea: 'Default Area',
      rewardPoints,
      // Roboflow detection fields
      isValidPothole: detectionResult.isValidPothole,
      detectionConfidence: detectionResult.detectionConfidence || 0,
      width: detectionResult.width,
      height: detectionResult.height,
      detectionData: {
        predictions: detectionResult.predictions || [],
        totalDetections: detectionResult.totalDetections || 0,
        timestamp: new Date()
      }
    });

    await newPothole.save();

    // Step 7: Update user's reward points and total reports
    if (rewardPoints > 0) {
      await User.findByIdAndUpdate(submittedBy, {
        $inc: {
          rewardPoints: rewardPoints,
          totalReports: 1
        }
      });

      // Check and unlock achievements
      await checkAndUnlockAchievements(submittedBy);
    }
    
    res.json({ 
      success: true,
      message: "Pothole reported successfully", 
      pothole: newPothole,
      detection: {
        confidence: detectionResult.detectionConfidence,
        width: detectionResult.width,
        height: detectionResult.height,
        isValidPothole: detectionResult.isValidPothole
      },
      assigned: !!assignedTo 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false,
      error: "Failed to process image",
      message: err.message 
    });
  }
});
router.get("/potholes", async (req, res) => {
  try {
    const potholes = await Pothole.find(
      {},
      { 
        latitude: 1, 
        longitude: 1, 
        timestamp: 1, 
        severity: 1, 
        status: 1,
        width: 1,
        height: 1,
        detectionConfidence: 1,
        isValidPothole: 1,
        location: 1,
        description: 1,
        createdAt: 1,
        _id: 1
      }
    ).sort({ createdAt: -1 });

    res.json(potholes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch potholes" });
  }
});

// Get reported potholes for municipality
router.get("/reported", async (req, res) => {
  try {
    const reported = await Pothole.find({ status: "reported" })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, potholes: reported });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch reported potholes" });
  }
});

// Get assigned potholes for municipality user
router.get("/assigned/:userId", async (req, res) => {
  try {
    const assigned = await Pothole.find({ 
      assignedTo: req.params.userId,
      status: 'under review'
    })
    .populate('submittedBy', 'name email phone')
    .sort({ assignedDate: -1 });

    res.json({ success: true, potholes: assigned });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch assigned potholes" });
  }
});

// Assign pothole to municipality user
router.put("/pothole/assign/:id", async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const status = "under review";
    const assignedDate = new Date();

    const updatedPothole = await Pothole.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status, assignedDate },
      { new: true }
    ).populate('submittedBy', 'name email');

    res.json({ success: true, message: "Pothole assigned successfully", pothole: updatedPothole });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to assign pothole" });
  }
});
// Mark pothole as complete with image upload
router.put("/pothole/complete/:id", upload.single('completionImage'), async (req, res) => {
  try {
    const { completionNotes } = req.body;
    const status = "completed";
    const dateOfCompletion = new Date();
    const completionImage = req.file ? req.file.filename : null;

    // Get the pothole first to access reward points
    const pothole = await Pothole.findById(req.params.id);
    if (!pothole) {
      return res.status(404).json({ success: false, error: "Pothole not found" });
    }

    const updatedPothole = await Pothole.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        dateOfCompletion, 
        completionImage,
        completionNotes 
      },
      { new: true }
    ).populate('submittedBy', 'name email');

    // Award reward points to the user when pothole is completed
    if (pothole.rewardPoints > 0) {
      await User.findByIdAndUpdate(pothole.submittedBy, {
        $inc: {
          rewardPoints: pothole.rewardPoints,
          completedReports: 1
        }
      });

      // Check and unlock achievements after completion
      await checkAndUnlockAchievements(pothole.submittedBy);
    }

    res.json({ 
      success: true, 
      message: "Pothole marked as completed",
      pothole: updatedPothole
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to complete pothole" });
  }
});

// Get completed potholes for municipality user
router.get("/completed/:userId", async (req, res) => {
  try {
    const completed = await Pothole.find({
      assignedTo: req.params.userId,
      status: "completed"
    })
    .populate("submittedBy", "name email phone")
    .sort({ dateOfCompletion: -1 });

    res.json({ success: true, potholes: completed });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch completed potholes" });
  }
});

// Get potholes by user ID (for commuter dashboard)
router.get("/pothole/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const userId = new mongoose.Types.ObjectId(req.params.id);

    const reported = await Pothole.find({ submittedBy: userId, status: "reported" }).lean();
    const assigned = await Pothole.find({ submittedBy: userId, status: "under review" }).lean();
    const completed = await Pothole.find({ submittedBy: userId, status: "completed" }).lean();

    res.json({
      reported: reported.map(p => ({ ...p, id: p._id, mapUrl: `https://www.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed` })),
      underRepair: assigned.map(p => ({ ...p, id: p._id, mapUrl: `https://www.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed` })),
      finished: completed.map(p => ({ ...p, id: p._id, mapUrl: `https://www.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed` })),
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pothole" });
  }
});

module.exports = router;
