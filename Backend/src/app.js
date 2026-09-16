const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const trainerRoutes = require('./routes/trainer.routes');
const adminRoutes = require('./routes/admin.routes');
const employerRoutes = require('./routes/employer.routes');
const aiRoutes = require('./routes/ai.routes');
const mentorshipRoutes = require('./routes/mentorship.routes');



const app = express();
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const contentRoutes = require('./routes/content.routes');
const assessmentRoutes = require('./routes/assesment.routes');
const communityRoutes = require('./routes/community.routes');

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/trainer', trainerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api', mentorshipRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/learners', studentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/self-assessments', assessmentRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'ETASHA SkillSetu API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mission: 'Enabling & Training Adolescents for Successful & Healthy Adulthood',
  });
});

// 404 Handler — must be last, after every route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;