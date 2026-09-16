const User = require('../models/User');
const Center = require('../models/center.model');
const Cohort = require('../models/cohort.model');
const Placement = require('../models/placement.model');
const Attendance = require('../models/attendance.model');
const Assessment = require('../models/assessment.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. GET Admin & Program Overview
exports.getAdminOverview = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;

    let totalUsers = 12;
    let studentsCount = 8;
    let trainersCount = 2;
    let employersCount = 2;
    let atRiskCount = 3;
    let avgAttendance = 83;
    let placedCount = 3;
    let centersCount = 4;
    let activeCohortsCount = 3;

    if (isDb) {
      totalUsers = await User.countDocuments();
      studentsCount = await User.countDocuments({ role: 'learner' });
      trainersCount = await User.countDocuments({ role: 'trainer' });
      employersCount = await User.countDocuments({ role: 'employer' });
      centersCount = await Center.countDocuments({ status: 'active' });
      activeCohortsCount = await Cohort.countDocuments({ status: 'active' });
      placedCount = await Placement.countDocuments({ status: 'placed' });

      const allLearners = await User.find({ role: 'learner' });
      if (allLearners.length > 0) {
        atRiskCount = allLearners.filter(
          (s) => (s.softSkillsProfile?.attendanceRate || 85) < 75 || (s.softSkillsProfile?.confidenceScore || 65) < 60
        ).length;

        avgAttendance = Math.round(
          allLearners.reduce((acc, s) => acc + (s.softSkillsProfile?.attendanceRate || 85), 0) /
            allLearners.length
        );
      }
    }

    const placementRate = studentsCount > 0 ? Math.round((placedCount / studentsCount) * 100) : 75;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        studentsCount,
        trainersCount,
        employersCount,
        centersCount: centersCount || 4,
        activeCohortsCount: activeCohortsCount || 3,
        placedCount,
        placementRate,
        atRiskCount,
        avgAttendance,
        overallImpactTrained: 38450, // Historical ETASHA trained benchmark
        overallImpactLives: 200000,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Manage Users and Roles
exports.getUsers = async (req, res) => {
  try {
    const { role, search, center } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (center && center !== 'all') query.center = center;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const isDb = mongoose.connection.readyState === 1;
    let users = [];

    if (isDb) {
      users = await User.find(query).select('-password').sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password = 'password123', role = 'learner', center = 'Sangam Vihar CDC', batch, organization } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Name and email or phone are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isDb = mongoose.connection.readyState === 1;

    let newUser = {
      name,
      email: email ? email.toLowerCase() : undefined,
      phone: phone || undefined,
      password: hashedPassword,
      role,
      center,
      batch: batch || 'Batch 2026-A',
      organization,
    };

    if (isDb) {
      newUser = await User.create(newUser);
    }

    res.status(201).json({
      success: true,
      message: `User ${name} created with role ${role}.`,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, center, batch } = req.body;

    const isDb = mongoose.connection.readyState === 1;
    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await User.findByIdAndUpdate(
        id,
        { $set: { role, center, batch } },
        { new: true }
      ).select('-password');

      return res.status(200).json({
        success: true,
        message: `User role updated to ${role}.`,
        user: updated,
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} (Local State).`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isDb = mongoose.connection.readyState === 1;

    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      await User.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'User removed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Manage Training Centers (CDCs)
exports.getCenters = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let centers = [];

    if (isDb) {
      centers = await Center.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: centers.length,
      centers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCenter = async (req, res) => {
  try {
    const { name, location, address, leadTrainer, capacity = 60, contactPhone } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Center name and location are required.' });
    }

    const isDb = mongoose.connection.readyState === 1;
    let newCenter = { name, location, address, leadTrainer, capacity, contactPhone };

    if (isDb) {
      newCenter = await Center.create(newCenter);
    }

    res.status(201).json({
      success: true,
      message: `Center "${name}" registered successfully.`,
      center: newCenter,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Manage Courses and Cohorts
exports.getCohorts = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let cohorts = [];

    if (isDb) {
      cohorts = await Cohort.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: cohorts.length,
      cohorts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCohort = async (req, res) => {
  try {
    const { name, courseName, center, trainerName, startDate, endDate, maxCapacity } = req.body;

    if (!name || !center) {
      return res.status(400).json({ success: false, message: 'Cohort name and center are required.' });
    }

    const isDb = mongoose.connection.readyState === 1;
    let newCohort = {
      name,
      courseName: courseName || 'Retail & Soft Skills Readiness',
      center,
      trainerName: trainerName || 'Sunita Sharma',
      startDate,
      endDate,
      maxCapacity: Number(maxCapacity) || 30,
      enrolledCount: 0,
    };

    if (isDb) {
      newCohort = await Cohort.create(newCohort);
    }

    res.status(201).json({
      success: true,
      message: `Cohort "${name}" created successfully.`,
      cohort: newCohort,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Monitor Enrollment and Attendance Analytics
exports.getEnrollmentAndAttendance = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let centerStats = [];

    if (isDb) {
      const centers = ['Sangam Vihar CDC', 'Khanpur CDC', 'Dakshinpuri CDC', 'Mangolpuri CDC'];
      for (const c of centers) {
        const learners = await User.find({ role: 'learner', center: c });
        const enrolled = learners.length;
        const avgAtt = enrolled > 0
          ? Math.round(learners.reduce((acc, s) => acc + (s.softSkillsProfile?.attendanceRate || 85), 0) / enrolled)
          : 85;

        centerStats.push({
          center: c,
          enrolledCount: enrolled,
          avgAttendanceRate: avgAtt,
          targetAttendance: 80,
          atRiskCount: learners.filter((s) => (s.softSkillsProfile?.attendanceRate || 85) < 75).length,
        });
      }
    }

    res.status(200).json({
      success: true,
      stats: centerStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. View Skill Progression Analytics (CSR Impact Breakdown)
exports.getSkillProgression = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let learners = [];

    if (isDb) {
      learners = await User.find({ role: 'learner' });
    }

    const count = learners.length || 1;
    const avgConfidence = Math.round(learners.reduce((acc, s) => acc + (s.softSkillsProfile?.confidenceScore || 65), 0) / count);
    const avgCommunication = Math.round(learners.reduce((acc, s) => acc + (s.softSkillsProfile?.communicationScore || 70), 0) / count);
    const avgWorkplaceEthics = Math.round(learners.reduce((acc, s) => acc + (s.softSkillsProfile?.workplaceEtiquetteScore || 75), 0) / count);
    const avgInterviewReadiness = Math.round(learners.reduce((acc, s) => acc + (s.softSkillsProfile?.interviewReadinessScore || 60), 0) / count);

    res.status(200).json({
      success: true,
      progression: [
        { competency: 'Confidence & Mindset', baselineScore: 45, currentScore: avgConfidence, targetScore: 80 },
        { competency: 'Spoken English & Articulation', baselineScore: 40, currentScore: avgCommunication, targetScore: 80 },
        { competency: 'Workplace Ethics & Grooming', baselineScore: 50, currentScore: avgWorkplaceEthics, targetScore: 85 },
        { competency: 'Job Interview Readiness', baselineScore: 35, currentScore: avgInterviewReadiness, targetScore: 75 },
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Track Placements
exports.getPlacements = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let placements = [];

    if (isDb) {
      placements = await Placement.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: placements.length,
      placements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recordPlacement = async (req, res) => {
  try {
    const { studentName, employerName, roleTitle, sector = 'Retail', monthlySalary, center, batch } = req.body;

    if (!studentName || !employerName || !monthlySalary) {
      return res.status(400).json({ success: false, message: 'Student, employer, and monthly salary are required.' });
    }

    const isDb = mongoose.connection.readyState === 1;
    let newPlacement = {
      studentName,
      employerName,
      roleTitle: roleTitle || 'Frontline Customer Associate',
      sector,
      monthlySalary: Number(monthlySalary),
      center: center || 'Sangam Vihar CDC',
      batch: batch || 'Batch 2026-A',
      status: 'placed',
    };

    if (isDb) {
      newPlacement = await Placement.create(newPlacement);
    }

    res.status(201).json({
      success: true,
      message: `Placement recorded: ${studentName} at ${employerName}!`,
      placement: newPlacement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Generate Impact Report (Donor & CSR Ready)
exports.getImpactReport = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let totalLearners = 8;
    let placedCount = 3;

    if (isDb) {
      totalLearners = await User.countDocuments({ role: 'learner' });
      placedCount = await Placement.countDocuments({ status: 'placed' });
    }

    const placementPercentage = totalLearners > 0 ? Math.round((placedCount / totalLearners) * 100) : 75;

    const report = {
      organization: 'ETASHA Society',
      reportTitle: 'Program Impact & CSR Evaluation Report',
      reportingPeriod: 'Annual Cohort Evaluation (2026)',
      generatedDate: new Date().toISOString().split('T')[0],
      executiveSummary: {
        mission: 'Enabling & Training Adolescents for Successful & Healthy Adulthood in low-income urban communities.',
        targetAudience: 'Youth aged 15–30 from resettlement colonies (Delhi/NCR) with monthly household incomes < Rs 6,000.',
        totalHistoricalImpact: '38,000+ individuals directly trained; 200,000+ lives impacted.',
        currentCohortSize: totalLearners,
        placementRate: `${placementPercentage}% (Benchmarked against 75–80% target)`,
        averageStartingSalary: 'INR 16,500 / month',
      },
      sectorDistribution: [
        { sector: 'Organized Retail', percentage: 45 },
        { sector: 'Hospitality & Customer Care', percentage: 30 },
        { sector: 'BPO & Tele-services', percentage: 15 },
        { sector: 'Computerized Accounting', percentage: 10 },
      ],
      keyFundersAndPartners: [
        'Tech For Social Good Program',
        'State Skill Development Mission',
        'Corporate CSR Partners (Apex Retail, Landmark, TechCare)',
      ],
    };

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
