const crypto = require('crypto');
const nodemailer = require("nodemailer");
require('dotenv').config();

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateLevel, calculateExperiencePoints } = require('../utils/rewards');

const router = express.Router();

// Signup validation rules (only for commuters) - Simplified password requirement
const signupValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Municipality user creation validation (admin only)
const createMunicipalityUserValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required for municipality users'),
  body('department').notEmpty().withMessage('Department is required for municipality users')
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// Public Signup (only for commuters) - No email verification required
router.post('/signup', signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create commuter user only - role is hardcoded to 'commuter'
    const user = new User({
      name,
      email,
      password,
      role: 'commuter', // Always set to commuter for public signup
      isVerified: true, // Auto-verify since we removed email verification
      isActive: true
    });

    await user.save();

    // Generate tokens for immediate login
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints || 0
      }
    });

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Admin-only route to create municipality users
router.post('/admin/create-municipality-user',
  authenticate,
  authorize('admin'),
  createMunicipalityUserValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, phone, department } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create municipality user
      const user = new User({
        name,
        email,
        password,
        role: 'municipality',
        phone,
        department,
        createdBy: req.user._id
      });

      await user.save();

      res.status(201).json({
        message: 'Municipality user created successfully',
        user
      });

    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all municipality users (admin only)
router.get('/admin/municipality-users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const municipalityUsers = await User.find({ role: 'municipality' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ users: municipalityUsers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update municipality user status (admin only)
router.patch('/admin/municipality-users/:userId/status',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await User.findById(userId);
      if (!user || user.role !== 'municipality') {
        return res.status(404).json({ error: 'Municipality user not found' });
      }

      user.isActive = isActive;
      await user.save();

      res.json({
        message: `Municipality user ${isActive ? 'activated' : 'deactivated'} successfully`,
        user
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all users (admin only) - add this route
router.get('/admin/all-users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const allUsers = await User.find({ role: { $ne: 'admin' } }) // Exclude admin users
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ users: allUsers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update any user status (admin only) - modify existing route to handle all users
router.patch('/admin/users/:userId/status',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent admin from deactivating themselves
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: 'Cannot modify your own account status' });
      }

      // Prevent modifying other admin accounts
      if (user.role === 'admin') {
        return res.status(400).json({ error: 'Cannot modify admin accounts' });
      }

      user.isActive = isActive;
      await user.save();

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login (for all users)
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and check password
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid credentials or account inactive'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Remove cookie setting - just return tokens
    res.json({
      message: 'Login successful',
      user,
      accessToken,
      refreshToken
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from request body instead of cookies
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive || !user.isVerified) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Return new tokens in response body
    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Email verification endpoints removed - no longer needed


// Logout - simplified since no cookies
router.post('/logout', (req, res) => {
  // No cookie clearing needed
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  const user = req.user.toObject();

  // Add calculated fields
  user.level = calculateLevel(user.rewardPoints || 0);
  user.experiencePoints = calculateExperiencePoints(user.rewardPoints || 0);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      rewardPoints: user.rewardPoints || 0,
      totalReports: user.totalReports || 0,
      completedReports: user.completedReports || 0,
      achievements: user.achievements || [],
      level: user.level,
      experiencePoints: user.experiencePoints,
      isActive: user.isActive,
      isVerified: user.isVerified,  // Added to frontend
      createdAt: user.createdAt
    }
  });
});
function sendEmail({ recipient_email, OTP }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mail_configs = {
      from: process.env.MY_EMAIL,
      to: recipient_email,
      subject: "Potholemapper Password Recovery OTP",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Koding 101 Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}
router.post("/send_recovery_email", (req, res) => {
  sendEmail(req.body)
    .then((response) => res.json({ message: response.message })) // ✅ send JSON instead of text
    .catch((error) => res.status(500).json({ message: error.message })); // ✅ same here
});


router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password directly
    user.password = password;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;