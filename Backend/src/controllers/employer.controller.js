const User = require('../models/User');
const Pipeline = require('../models/pipeline.model');
const Placement = require('../models/placement.model');
const Assessment = require('../models/assessment.model');
const mongoose = require('mongoose');

// 1. Get Employer Profile & Overview KPIs
exports.getEmployerProfile = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;

    let totalGraduates = 8;
    let shortlistedCount = 0;
    let interviewCount = 0;
    let offeredCount = 0;
    let hiredCount = 0;

    let company = {
      name: 'Apex Retail Solutions',
      contactPerson: 'Rajesh Gupta',
      email: 'rajesh.employer@etasha.org',
      phone: '+91 98102 33445',
      industry: 'Organized Retail & Customer Care',
      locations: ['South Delhi', 'Noida', 'Gurugram'],
      openPositions: [
        { title: 'Customer Sales Associate', openings: 15, minSalary: 16000 },
        { title: 'Frontline Cashier & Billing', openings: 8, minSalary: 15500 },
        { title: 'Store Inventory Assistant', openings: 5, minSalary: 17000 },
      ],
      hiringTarget: 30,
    };

    if (isDb) {
      totalGraduates = await User.countDocuments({ role: 'learner' });
      shortlistedCount = await Pipeline.countDocuments({ stage: 'shortlisted' });
      interviewCount = await Pipeline.countDocuments({ stage: 'interview_scheduled' });
      offeredCount = await Pipeline.countDocuments({ stage: 'offered' });
      hiredCount = await Pipeline.countDocuments({ stage: 'hired' });

      // If user is logged in as employer, load their profile
      if (req.user && req.user._id) {
        const empUser = await User.findById(req.user._id);
        if (empUser) {
          company.contactPerson = empUser.name;
          company.email = empUser.email;
          if (empUser.organization) company.name = empUser.organization;
        }
      }
    }

    res.status(200).json({
      success: true,
      company,
      metrics: {
        totalGraduates,
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
    const { companyName, contactPerson, industry, phone, openPositions } = req.body;
    const isDb = mongoose.connection.readyState === 1;

    if (isDb && req.user && req.user._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          name: contactPerson || req.user.name,
          organization: companyName,
          phone,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employer profile updated successfully.',
      company: {
        name: companyName || 'Apex Retail Solutions',
        contactPerson: contactPerson || 'Rajesh Gupta',
        industry: industry || 'Organized Retail & Customer Care',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. View Graduate Profiles & Candidate Search
exports.getGraduates = async (req, res) => {
  try {
    const { search, center, badge, minScore, status } = req.query;
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
      const learners = await User.find(query).select('-password').sort({ 'softSkillsProfile.confidenceScore': -1 });

      // Fetch active pipeline to know shortlisted/interview status
      const pipelineEntries = await Pipeline.find();
      const pipelineMap = {};
      pipelineEntries.forEach((p) => {
        pipelineMap[p.candidateId.toString()] = p.stage;
      });

      graduates = learners.map((l) => {
        const doc = l.toObject();
        doc.pipelineStage = pipelineMap[l._id.toString()] || 'available';
        return doc;
      });

      if (status && status !== 'all') {
        graduates = graduates.filter((g) => g.pipelineStage === status);
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

// 4. Candidate Deep Profile (Badges, Assessments & Trainer Endorsements)
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

    // Fetch pipeline status if exists
    const pipeline = await Pipeline.findOne({ candidateId: id });

    res.status(200).json({
      success: true,
      candidate,
      assessments,
      pipeline,
      trainerEndorsements: [
        {
          trainerName: 'Sunita Sharma',
          role: 'Lead Soft Skills Faculty',
          date: '2026-03-10',
          remark:
            candidate.softSkillsProfile?.trainerNotes ||
            'Strong customer interaction skills, polite spoken English, and high punctuality.',
          recommendedRoles: ['Customer Service Associate', 'Cashier', 'Front Desk Assistant'],
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Hiring Pipeline
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

// 6. Shortlist Candidate / Add to Hiring Pipeline
exports.addToPipeline = async (req, res) => {
  try {
    const { candidateId, roleApplied = 'Frontline Customer Associate', notes, offeredSalary = 16500 } = req.body;

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
        if (notes) existing.notes = notes;
        await existing.save();
        entry = existing;
      } else {
        entry = await Pipeline.create({
          candidateId,
          candidateName: candidate.name,
          roleApplied,
          stage: 'shortlisted',
          notes: notes || 'Shortlisted from ETASHA Graduate Talent Pool.',
          offeredSalary: Number(offeredSalary) || 16500,
          center: candidate.center || 'Sangam Vihar CDC',
          batch: candidate.batch || 'Batch 2026-A',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Candidate shortlisted into hiring pipeline.`,
      pipelineEntry: entry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Update Pipeline Stage (Shortlisted -> Interview -> Offered -> Hired -> Rejected)
exports.updatePipelineStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, interviewDate, interviewTime, offeredSalary, notes, roleApplied, employerName = 'Apex Retail Solutions' } = req.body;

    const isDb = mongoose.connection.readyState === 1;

    if (isDb && mongoose.Types.ObjectId.isValid(id)) {
      const updateData = { stage };
      if (interviewDate) updateData.interviewDate = interviewDate;
      if (interviewTime) updateData.interviewTime = interviewTime;
      if (offeredSalary) updateData.offeredSalary = Number(offeredSalary);
      if (notes) updateData.notes = notes;
      if (roleApplied) updateData.roleApplied = roleApplied;

      const updated = await Pipeline.findByIdAndUpdate(id, { $set: updateData }, { new: true });

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
              employerName: employerName || updated.employerName || 'Apex Retail Solutions',
              roleTitle: updated.roleApplied || 'Frontline Customer Associate',
              sector: 'Retail',
              monthlySalary: updated.offeredSalary || 16500,
              placementDate: new Date().toISOString().split('T')[0],
              center: updated.center || 'Sangam Vihar CDC',
              batch: updated.batch || 'Batch 2026-A',
              status: 'placed',
            },
          },
          { upsert: true, new: true }
        );

        // Update learner profile designation
        if (candidate) {
          candidate.designation = `${updated.roleApplied} at ${employerName}`;
          await candidate.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: `Candidate moved to stage "${stage}".`,
        pipelineEntry: updated,
      });
    }

    res.status(200).json({
      success: true,
      message: `Stage updated to "${stage}" (Local State).`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
