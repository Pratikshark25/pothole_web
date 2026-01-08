const mongoose = require('mongoose');

const potholeSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  completionImage: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  // Roboflow detection fields
  isValidPothole: {
    type: Boolean,
    default: false
  },
  detectionConfidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  width: {
    type: Number,
    default: null,
    description: 'Pothole width in pixels from detection'
  },
  height: {
    type: Number,
    default: null,
    description: 'Pothole height in pixels from detection'
  },
  detectionData: {
    type: Object,
    default: null,
    description: 'Full detection response from Roboflow'
  },
  status: {
    type: String,
    enum: ["reported", "under review", "completed"],
    default: "reported",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedDate: {
    type: Date,
  },
  dateOfCompletion: {
    type: Date,
  },
  completionNotes: {
    type: String,
    default: ''
  },
  municipalityArea: {
    type: String,
    default: null // Store municipality area for location-based assignment
  },
  rewardPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pothole', potholeSchema);
