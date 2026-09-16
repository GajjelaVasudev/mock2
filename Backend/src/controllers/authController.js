const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET =
  process.env.JWT_SECRET || 'etasha_social_good_jwt_secret_key_2026';

// Pre-configured Demo Users for instant testing & offline resilience
const DEMO_USERS = [
  {
    id: 'demo-learner-1',
    name: 'Pooja Kumari',
    email: 'pooja.learner@etasha.org',
    phone: '9876543210',
    password: 'password123',
    role: 'learner',
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A (Retail & Soft Skills)',
    preferredLanguage: 'hi',
    softSkillsProfile: {
      confidenceScore: 78,
      communicationScore: 82,
      workplaceEtiquetteScore: 85,
      interviewReadinessScore: 74,
      badgesEarned: ['Active Communicator', 'Confidence Champion', 'Punctuality Star'],
      attendanceRate: 94,
      mockInterviewsCompleted: 3,
      trainerNotes: 'Extremely proactive during roleplays. Ready for retail customer assistant interviews.',
    },
  },
  {
    id: 'demo-trainer-1',
    name: 'Sunita Sharma',
    email: 'sunita.trainer@etasha.org',
    phone: '9876543211',
    password: 'password123',
    role: 'trainer',
    center: 'Sangam Vihar CDC',
    batch: 'Lead Facilitator - Soft Skills & Spoken English',
    preferredLanguage: 'hi',
    softSkillsProfile: {
      badgesEarned: ['Master Facilitator', '100% Placement Mentor'],
    },
  },
  {
    id: 'demo-employer-1',
    name: 'Rajesh Mehra',
    email: 'rajesh.employer@etasha.org',
    phone: '9876543212',
    password: 'password123',
    role: 'employer',
    organization: 'Apex Retail & Hospitality Partners',
    designation: 'Head of Talent Acquisition',
    center: 'Central HQ',
    preferredLanguage: 'en',
  },
  {
    id: 'demo-admin-1',
    name: 'Dr. Meenakshi & Impact Team',
    email: 'admin@etasha.org',
    phone: '9876543213',
    password: 'password123',
    role: 'admin',
    designation: 'Program & M&E Director',
    center: 'Central HQ',
    preferredLanguage: 'en',
  },
];

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const tokenPayload = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    center: user.center,
  };

  const token = generateToken(tokenPayload);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };

  // Safe user representation (omit password)
  const safeUser = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    center: user.center,
    batch: user.batch,
    preferredLanguage: user.preferredLanguage,
    organization: user.organization,
    designation: user.designation,
    softSkillsProfile: user.softSkillsProfile || {
      confidenceScore: 65,
      communicationScore: 70,
      workplaceEtiquetteScore: 68,
      interviewReadinessScore: 60,
      badgesEarned: ['Active Learner'],
      attendanceRate: 85,
      mockInterviewsCompleted: 1,
    },
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: safeUser,
  });
};

// @desc   Register User
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'learner',
      center = 'Sangam Vihar CDC',
      batch,
      preferredLanguage = 'hi',
      organization,
    } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Password, and either Email or Mobile Number.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Check existing user
      const query = [];
      if (email) query.push({ email: email.toLowerCase() });
      if (phone) query.push({ phone });

      const existing = await User.findOne({ $or: query });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email or mobile number already exists.',
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email: email ? email.toLowerCase() : undefined,
        phone: phone || undefined,
        password: hashedPassword,
        role,
        center,
        batch: batch || (role === 'learner' ? 'Batch 2026-A' : undefined),
        preferredLanguage,
        organization,
      });

      return sendTokenResponse(newUser, 201, res);
    } else {
      // Offline / In-Memory Mock Registration
      const mockNewUser = {
        id: 'mock-user-' + Date.now(),
        name,
        email: email ? email.toLowerCase() : `user${Date.now()}@etasha.local`,
        phone: phone || '',
        role,
        center,
        batch: batch || 'Batch 2026-A',
        preferredLanguage,
        organization,
        softSkillsProfile: {
          confidenceScore: 60,
          communicationScore: 65,
          workplaceEtiquetteScore: 65,
          interviewReadinessScore: 55,
          badgesEarned: ['New Trainee'],
          attendanceRate: 100,
          mockInterviewsCompleted: 0,
        },
      };

      return sendTokenResponse(mockNewUser, 201, res);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc   Login User
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { identifier, email, phone, password, role } = req.body;
    const loginIdentifier = (identifier || email || phone || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Email or Mobile Number and Password.',
      });
    }

    // 1. Check Demo accounts first (for fast testing across roles)
    const matchedDemo = DEMO_USERS.find(
      (u) =>
        (u.email.toLowerCase() === loginIdentifier.toLowerCase() ||
          u.phone === loginIdentifier) &&
        (u.password === password || password === 'password123' || password === 'demo123') &&
        (!role || u.role === role)
    );

    if (matchedDemo) {
      return sendTokenResponse(matchedDemo, 200, res);
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Find user by email or phone
      const user = await User.findOne({
        $or: [
          { email: loginIdentifier.toLowerCase() },
          { phone: loginIdentifier },
        ],
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/phone or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/phone or password.',
        });
      }

      return sendTokenResponse(user, 200, res);
    } else {
      // Fallback fallback: If identifier has some text, allow testing account
      const fallbackUser = {
        id: 'user-' + Date.now(),
        name: loginIdentifier.split('@')[0] || 'ETASHA Member',
        email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@etasha.org`,
        phone: loginIdentifier.includes('@') ? '' : loginIdentifier,
        role: role || 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        preferredLanguage: 'hi',
        softSkillsProfile: {
          confidenceScore: 70,
          communicationScore: 75,
          workplaceEtiquetteScore: 80,
          interviewReadinessScore: 68,
          badgesEarned: ['Active Learner', 'Communication Starter'],
          attendanceRate: 90,
          mockInterviewsCompleted: 2,
        },
      };
      return sendTokenResponse(fallbackUser, 200, res);
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc   Get Current Logged in User
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected && req.user.id) {
      const user = await User.findById(req.user.id).select('-password');
      if (user) {
        return res.status(200).json({
          success: true,
          user,
        });
      }
    }

    // Demo / fallback user
    const demo = DEMO_USERS.find((u) => u.id === req.user.id);
    if (demo) {
      const { password, ...safeDemo } = demo;
      return res.status(200).json({
        success: true,
        user: safeDemo,
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile.',
    });
  }
};

// @desc   Get Demo Users list for quick testing
// @route  GET /api/auth/demo-users
// @access Public
exports.getDemoUsers = (req, res) => {
  const safeDemos = DEMO_USERS.map(({ password, ...rest }) => ({
    ...rest,
    samplePassword: password,
  }));
  res.status(200).json({
    success: true,
    demoUsers: safeDemos,
  });
};
