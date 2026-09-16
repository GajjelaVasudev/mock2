const User = require('../models/User');
const Pipeline = require('../models/pipeline.model');
const Placement = require('../models/placement.model');
const Assessment = require('../models/assessment.model');
const Attendance = require('../models/attendance.model');
const Job = require('../models/job.model');
const mongoose = require('mongoose');

// Default initial jobs for initial DB population & resilience
const DEFAULT_JOBS = [];

// Helper to calculate student match score against a job
function calculateMatchScore(student, job) {
  let score = 0;
  let totalWeight = 100;
  const reasons = [];

  const conf = student.softSkillsProfile?.confidenceScore || 65;
  const comm = student.softSkillsProfile?.communicationScore || 70;
  const att = student.softSkillsProfile?.attendanceRate || 85;
  const badges = student.softSkillsProfile?.badgesEarned || [];

  // 1. Confidence Score (30%)
  if (conf >= job.minConfidenceScore) {
    score += 30;
    reasons.push(`Confidence score (${conf}%) meets requirement (>=${job.minConfidenceScore}%)`);
  } else {
    score += Math.max(0, Math.round((conf / job.minConfidenceScore) * 30));
  }

  // 2. Attendance Rate (25%)
  if (att >= job.minAttendanceRate) {
    score += 25;
    reasons.push(`High attendance rate (${att}%)`);
  } else {
    score += Math.max(0, Math.round((att / job.minAttendanceRate) * 25));
  }

  // 3. Badges Match (25%)
  if (job.requiredBadges && job.requiredBadges.length > 0) {
    const matchedBadges = job.requiredBadges.filter((b) => badges.includes(b));
    const badgeRatio = matchedBadges.length / job.requiredBadges.length;
    score += Math.round(badgeRatio * 25);
    if (matchedBadges.length > 0) {
      reasons.push(`Has required badges: ${matchedBadges.join(', ')}`);
    }
  } else {
    score += 25;
  }

  // 4. Communication & Center Match (20%)
  if (comm >= 70) {
    score += 10;
  }
  if (job.location && student.center && job.location.toLowerCase().includes(student.center.toLowerCase().split(' ')[0])) {
    score += 10;
    reasons.push(`Center located nearby (${student.center})`);
  } else {
    score += 5;
  }

  return {
    matchPercentage: Math.min(100, Math.max(40, score)),
    matchReasons: reasons,
  };
}

// 1. Get Employer Profile & Overview KPIs
exports.getEmployerProfile = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;

    let totalGraduates = 10;
    let shortlistedCount = 0;
    let interviewCount = 0;
    let offeredCount = 0;
    let hiredCount = 0;
    let activeJobsCount = DEFAULT_JOBS.length;

    let company = {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: '',
      locations: [],
      hiringTarget: 1,
    };

    if (isDb) {
      totalGraduates = await User.countDocuments({ role: 'learner' });
      shortlistedCount = await Pipeline.countDocuments({ stage: 'shortlisted' });
      interviewCount = await Pipeline.countDocuments({ stage: 'interview_scheduled' });
      offeredCount = await Pipeline.countDocuments({ stage: 'offered' });
      hiredCount = await Pipeline.countDocuments({ stage: 'hired' });

      // Seed jobs if empty
      const jobCount = await Job.countDocuments();
      
      activeJobsCount = await Job.countDocuments({ status: 'active' });

      if (req.user && req.user._id) {
        const empUser = await User.findById(req.user._id);
        if (empUser) {
          company.contactPerson = empUser.name;
          company.email = empUser.email;
          if (empUser.organization) company.name = empUser.organization;
          if (empUser.phone) company.phone = empUser.phone;
        }
      }
    }

    res.status(200).json({
      success: true,
      company,
      metrics: {
        totalGraduates,
        activeJobsCount,
        shortlistedCount,
        interviewCount,
        offeredCount,
        hiredCount,
        conversionRate: totalGraduates > 0 ? Math.round((hiredCount / totalGraduates) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Employer Registration / Profile
exports.updateEmployerProfile = async (req, res) => {
  try {
    const { companyName, contactPerson, industry, phone, hiringTarget, locations } = req.body;
    const isDb = mongoose.connection.readyState === 1;

    if (isDb && req.user && req.user._id) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            name: contactPerson || req.user.name,
            organization: companyName,
            phone,
          },
        },
        { returnDocument: 'after' }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Employer profile updated successfully.',
      company: {
        name: companyName || '',
        contactPerson: contactPerson || '',
        industry: industry || '',
        phone: phone || '',
        hiringTarget: Number(hiringTarget) || 1,
        locations: locations || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET All Jobs
exports.getJobs = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let jobs = [];

    if (isDb) {
      jobs = await Job.find().sort({ createdAt: -1 });
      
    } else {
      jobs = DEFAULT_JOBS;
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. POST Create New Job
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      roleCategory = 'Retail',
      employerName = 'Apex Retail Partners',
      openings = 5,
      minSalary = 16000,
      maxSalary = 20000,
      location = 'South Delhi',
      jobType = 'Full-Time',
      description,
      requirements = [],
      requiredBadges = [],
      minConfidenceScore = 65,
      minAttendanceRate = 75,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Job title is required.' });
    }

    const isDb = mongoose.connection.readyState === 1;
    let newJob;

    if (isDb) {
      newJob = await Job.create({
        title,
        roleCategory,
        employerName,
        openings: Number(openings) || 5,
        minSalary: Number(minSalary) || 16000,
        maxSalary: Number(maxSalary) || 20000,
        location,
        jobType,
        description: description || `Hiring for ${title} role.`,
        requirements: Array.isArray(requirements) ? requirements : [requirements],
        requiredBadges: Array.isArray(requiredBadges) ? requiredBadges : [requiredBadges],
        minConfidenceScore: Number(minConfidenceScore) || 65,
        minAttendanceRate: Number(minAttendanceRate) || 75,
        status: 'active',
      });
    } else {
      newJob = {
        _id: 'job-' + Date.now(),
        title,
        roleCategory,
        openings,
        minSalary,
        maxSalary,
        location,
        jobType,
        description,
        requiredBadges,
        status: 'active',
      };
    }

    res.status(201).json({
      success: true,
      message: `Job vacancy "${title}" posted successfully!`,
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. PUT Update Job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const isDb = mongoose.connection.readyState === 1;

    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Job.findByIdAndUpdate(
        id,
        { $set: req.body },
        { returnDocument: 'after' }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Job not found.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Job updated successfully.',
        job: updated,
      });
    }

    res.status(200).json({ success: true, message: 'Job updated (local mode).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. DELETE / Close Job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const isDb = mongoose.connection.readyState === 1;

    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      await Job.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Job vacancy removed.' });
    }

    res.status(200).json({ success: true, message: 'Job removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET Matched Candidates for a Specific Job
exports.getMatchedStudentsForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const isDb = mongoose.connection.readyState === 1;

    let targetJob;
    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      targetJob = await Job.findById(id);
    }
    if (!targetJob) {
      targetJob = DEFAULT_JOBS[0];
    }

    let learners = [];
    if (isDb) {
      learners = await User.find({ role: 'learner' }).select('-password');
    }

    // Calculate match percentage for every student
    const scoredStudents = learners.map((l) => {
      const doc = l.toObject();
      const match = calculateMatchScore(doc, targetJob);
      return {
        ...doc,
        ...match,
      };
    });

    // Sort by match percentage descending
    scoredStudents.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      job: targetJob,
      count: scoredStudents.length,
      matchedStudents: scoredStudents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. View Graduate Profiles & Candidate Search
exports.getGraduates = async (req, res) => {
  try {
    const { search, center, badge, minScore, status, jobId } = req.query;
    const isDb = mongoose.connection.readyState === 1;

    let query = { role: 'learner' };

    if (center && center !== 'all') {
      query.center = center;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (badge && badge !== 'all') {
      query['softSkillsProfile.badgesEarned'] = badge;
    }

    if (minScore) {
      const score = Number(minScore);
      query['softSkillsProfile.confidenceScore'] = { $gte: score };
    }

    let graduates = [];

    if (isDb) {
      const learners = await User.find(query)
        .select('-password')
        .sort({ 'softSkillsProfile.confidenceScore': -1 });

      // Fetch active pipeline to know shortlisted/interview status
      const pipelineEntries = await Pipeline.find();
      const pipelineMap = {};
      const pipelineRoleMap = {};
      pipelineEntries.forEach((p) => {
        pipelineMap[p.candidateId.toString()] = p.stage;
        pipelineRoleMap[p.candidateId.toString()] = p.roleApplied;
      });

      // Optionally compute matching against a selected job
      let targetJob = null;
      if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
        targetJob = await Job.findById(jobId);
      }

      graduates = learners.map((l) => {
        const doc = l.toObject();
        doc.pipelineStage = pipelineMap[l._id.toString()] || 'available';
        doc.pipelineRole = pipelineRoleMap[l._id.toString()] || '';

        if (targetJob) {
          const match = calculateMatchScore(doc, targetJob);
          doc.matchPercentage = match.matchPercentage;
          doc.matchReasons = match.matchReasons;
        } else {
          // Default match against general retail associate
          const defaultJob = DEFAULT_JOBS[0];
          const match = calculateMatchScore(doc, defaultJob);
          doc.matchPercentage = match.matchPercentage;
          doc.matchReasons = match.matchReasons;
        }

        return doc;
      });

      if (status && status !== 'all') {
        graduates = graduates.filter((g) => g.pipelineStage === status);
      }

      // If matching against a job, sort by match score
      if (jobId) {
        graduates.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      }
    }

    res.status(200).json({
      success: true,
      count: graduates.length,
      graduates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Candidate Deep Profile (Badges, Attendance, Assessments & Endorsements)
exports.getCandidateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const isDb = mongoose.connection.readyState === 1;

    if (!isDb || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const candidate = await User.findById(id).select('-password');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Fetch assessment history
    const assessments = await Assessment.find({ studentId: id }).sort({ createdAt: -1 });

    // Fetch attendance records from database
    const attendanceRecords = await Attendance.find({ studentId: id }).sort({ date: -1 }).limit(10);

    // Fetch pipeline status if exists
    const pipeline = await Pipeline.findOne({ candidateId: id });

    res.status(200).json({
      success: true,
      candidate,
      assessments,
      attendanceRecords,
      pipeline,
      trainerEndorsements: [
        {
          trainerName: 'Sunita Sharma',
          role: 'Lead Soft Skills Faculty & Placement Mentor',
          date: '2026-03-12',
          remark:
            candidate.softSkillsProfile?.trainerNotes ||
            'Strong interpersonal communication, customer-centric attitude, high attendance and grooming standards.',
          recommendedRoles: ['Customer Sales Associate', 'Cashier & Billing', 'Front Desk Assistant'],
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Get Hiring Pipeline
exports.getPipeline = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let pipeline = [];

    if (isDb) {
      pipeline = await Pipeline.find().sort({ updatedAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: pipeline.length,
      pipeline,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Shortlist Candidate / Add to Hiring Pipeline
exports.addToPipeline = async (req, res) => {
  try {
    const {
      candidateId,
      roleApplied = 'Customer Sales Associate',
      notes,
      offeredSalary = 16500,
      employerName = 'Apex Retail Partners',
    } = req.body;

    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    const isDb = mongoose.connection.readyState === 1;
    let entry;

    if (isDb) {
      const candidate = await User.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate not found.' });
      }

      // Check if already in pipeline
      let existing = await Pipeline.findOne({ candidateId });
      if (existing) {
        existing.stage = 'shortlisted';
        existing.roleApplied = roleApplied;
        existing.employerName = employerName;
        if (notes) existing.notes = notes;
        await existing.save();
        entry = existing;
      } else {
        entry = await Pipeline.create({
          candidateId,
          candidateName: candidate.name,
          employerName,
          roleApplied,
          stage: 'shortlisted',
          notes: notes || `Candidate shortlisted for ${roleApplied} role based on soft skills profile.`,
          offeredSalary: Number(offeredSalary) || 16500,
          center: candidate.center || 'Sangam Vihar CDC',
          batch: candidate.batch || 'Batch 2026-A',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Candidate shortlisted into hiring pipeline for "${roleApplied}".`,
      pipelineEntry: entry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. Update Pipeline Stage (Shortlisted -> Interview -> Offered -> Hired -> Rejected)
exports.updatePipelineStage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stage,
      interviewDate,
      interviewTime,
      offeredSalary,
      notes,
      roleApplied,
      employerName = 'Apex Retail Partners',
    } = req.body;

    const isDb = mongoose.connection.readyState === 1;

    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      const updateData = { stage };
      if (interviewDate) updateData.interviewDate = interviewDate;
      if (interviewTime) updateData.interviewTime = interviewTime;
      if (offeredSalary) updateData.offeredSalary = Number(offeredSalary);
      if (notes) updateData.notes = notes;
      if (roleApplied) updateData.roleApplied = roleApplied;
      if (employerName) updateData.employerName = employerName;

      const updated = await Pipeline.findByIdAndUpdate(
        id,
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Pipeline record not found.' });
      }

      // REAL-TIME CROSS-ROLE SYNC: If hired, create placement record in Placement model
      if (stage === 'hired') {
        const candidate = await User.findById(updated.candidateId);
        await Placement.findOneAndUpdate(
          { studentName: updated.candidateName },
          {
            $set: {
              studentId: updated.candidateId,
              studentName: updated.candidateName,
              employerName: employerName || updated.employerName || 'Apex Retail Partners',
              roleTitle: updated.roleApplied || 'Customer Sales Associate',
              sector: 'Retail & Customer Care',
              monthlySalary: updated.offeredSalary || 16500,
              placementDate: new Date().toISOString().split('T')[0],
              center: updated.center || 'Sangam Vihar CDC',
              batch: updated.batch || 'Batch 2026-A',
              status: 'placed',
            },
          },
          { upsert: true, returnDocument: 'after' }
        );

        // Update learner profile designation in User model
        if (candidate) {
          candidate.designation = `${updated.roleApplied} at ${employerName}`;
          await candidate.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: `Candidate status updated to "${stage.replace('_', ' ').toUpperCase()}".`,
        pipelineEntry: updated,
      });
    }

    res.status(200).json({
      success: true,
      message: `Stage updated to "${stage}".`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
