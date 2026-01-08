const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['commuter', 'municipality', 'admin'],
    default: 'commuter'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // verification token (hashed)
  verifyToken: { type: String },
  verifyTokenExpires: { type: Date },

  // password reset token (hashed)
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  rewardPoints: {
    type: Number,
    default: 0
  },
  totalReports: {
    type: Number,
    default: 0
  },
  completedReports: {
    type: Number,
    default: 0
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: Date,
    icon: String
  }],
  municipalityArea: {
    type: String,
    default: null // For location-based assignment
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create verification token (returns raw token to send via email)
userSchema.methods.createVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verifyToken = crypto.createHash('sha256').update(token).digest('hex');
  // expires in 24 hours
  this.verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// Create password reset token (returns raw token)
userSchema.methods.createPasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  // expires in 1 hour
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

module.exports = mongoose.model('User', userSchema);