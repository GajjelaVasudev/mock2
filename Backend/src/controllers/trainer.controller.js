const User = require('../models/User');
const Attendance = require('../models/attendance.model');
const Assessment = require('../models/assessment.model');
const Task = require('../models/task.model');
const mongoose = require('mongoose');

// Default Cohort Students
const DEFAULT_COHORT = [
  {
    id: 'demo-student-1',
    _id: 'demo-student-1',
    name: 'Pooja Kumari',
    email: 'pooja.learner@etasha.org',
    phone: '9876543210',
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A',
    role: 'student',
    attendanceRate: 92,
    atRisk: false,
    riskReason: '',
    softSkillsProfile: {
      confidenceScore: 78,
      communicationScore: 82,
      workplaceEtiquetteScore: 85,
      interviewReadinessScore: 74,
      badgesEarned: ['Active Communicator', 'Confidence Champion', 'Punctuality Star'],
      mockInterviewsCompleted: 3,
      trainerNotes: 'High participation in group roleplays. Ready for retail customer interviews.',
    },
  },
  {
    id: 'demo-student-2',
    _id: 'demo-student-2',
    name: 'Rahul Kumar Sharma',
    email: 'rahul.s@etasha.org',
    phone: '9811223344',
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A',
    role: 'student',
    attendanceRate: 68,
    atRisk: true,
    riskReason: 'Low attendance (68%) & missed 2 mock interview sessions',
    softSkillsProfile: {
      confidenceScore: 52,
      communicationScore: 58,
      workplaceEtiquetteScore: 65,
      interviewReadinessScore: 48,
      badgesEarned: ['New Trainee'],
      mockInterviewsCompleted: 1,
      trainerNotes: 'Hesitation during English self-introduction.',
    },
  },
  {
    id: 'demo-student-3',
    _id: 'demo-student-3',
    name: 'Anjali Devi',
    email: 'anjali.d@etasha.org',
    phone: '9822334455',
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A',
    role: 'student',
    attendanceRate: 96,
    atRisk: false,
    riskReason: '',
    softSkillsProfile: {
      confidenceScore: 84,
      communicationScore: 88,
      workplaceEtiquetteScore: 90,
      interviewReadinessScore: 82,
      badgesEarned: ['Active Communicator', 'Customer Service Star', 'Team Leader'],
      mockInterviewsCompleted: 4,
      trainerNotes: 'Ready for frontline retail interview rounds.',
    },
  },
  {
    id: 'demo-student-4',
    _id: 'demo-student-4',
    name: 'Vikas Maurya',
    email: 'vikas.m@etasha.org',
    phone: '9833445566',
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A',
    role: 'student',
    attendanceRate: 64,
    atRisk: true,
    riskReason: 'Sudden attendance drop & incomplete customer service assignment',
    softSkillsProfile: {
      confidenceScore: 50,
      communicationScore: 55,
      workplaceEtiquetteScore: 60,
      interviewReadinessScore: 45,
      badgesEarned: ['New Trainee'],
      mockInterviewsCompleted: 0,
      trainerNotes: 'Needs 1-on-1 counseling regarding travel from resettlement colony.',
    },
  },
  {
    id: 'demo-student-5',
    _id: 'demo-student-5',
    name: 'Kavita Singh',
    email: 'kavita.s@etasha.org',
    phone: '9844556677',
    center: 'Sangam Vihar CDC',
    batch: 'Batch 2026-A',
    role: 'student',
    attendanceRate: 88,
    atRisk: false,
    riskReason: '',
    softSkillsProfile: {
      confidenceScore: 74,
      communicationScore: 76,
      workplaceEtiquetteScore: 80,
      interviewReadinessScore: 70,
      badgesEarned: ['Punctuality Star', 'Active Communicator'],
      mockInterviewsCompleted: 2,
      trainerNotes: 'Good progress in conversational English exercises.',
    },
  },
];

let inMemoryStudents = [...DEFAULT_COHORT];

let inMemoryTasks = [
  {
    id: 'task-1',
    _id: 'task-1',
    title: 'Record 30-Second Professional Self-Introduction',
    description: 'Practice state of origin, education, career objective, and why you want to work in retail.',
    category: 'Spoken English',
    targetType: 'batch',
    batch: 'Batch 2026-A',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    status: 'pending',
  },
  {
    id: 'task-2',
    _id: 'task-2',
    title: 'Customer Complaint Handling Roleplay Exercise',
    description: 'Prepare a 2-minute dialogue handling an angry customer returning a defective product with courtesy.',
    category: 'Customer Service Roleplay',
    targetType: 'batch',
    batch: 'Batch 2026-A',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    status: 'pending',
  },
  {
    id: 'task-3',
    _id: 'task-3',
    title: 'Remedial 1-on-1 English Greeting Practice',
    description: 'Practice 5 formal greeting scenarios with peer partner.',
    category: 'Spoken English',
    targetType: 'individual',
    studentId: 'demo-student-2',
    studentName: 'Rahul Kumar Sharma',
    batch: 'Batch 2026-A',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    status: 'pending',
  },
];

let inMemoryAttendance = {};

async function getAllCohortStudents() {
  const isDb = mongoose.connection.readyState === 1;

  if (isDb) {
    try {
      const dbStudents = await User.find({ role: 'student' }).select('-password');
      if (dbStudents.length > 0) {
        return dbStudents.map((dbS) => {
          const obj = dbS.toObject();
          const att =
            obj.softSkillsProfile?.attendanceRate !== undefined
              ? obj.softSkillsProfile.attendanceRate
              : 85;
          const conf = obj.softSkillsProfile?.confidenceScore || 65;
          const isRisk = att < 75 || conf < 60;

          return {
            ...obj,
            id: obj._id.toString(),
            _id: obj._id.toString(),
            attendanceRate: att,
            atRisk: isRisk,
            riskReason: isRisk ? `Low attendance (${att}%) or confidence (${conf}%)` : '',
          };
        });
      }
    } catch (e) {
      console.warn('Error querying db students:', e.message);
    }
  }

  return inMemoryStudents;
}

// 1. GET Overview / KPIs
exports.getTrainerOverview = async (req, res) => {
  try {
    const students = await getAllCohortStudents();
    const totalStudents = students.length;
    const atRiskCount = students.filter((s) => s.atRisk).length;

    const avgAttendance = Math.round(
      students.reduce((acc, s) => acc + (s.attendanceRate || 85), 0) / (totalStudents || 1)
    );

    const avgConfidence = Math.round(
      students.reduce((acc, s) => acc + (s.softSkillsProfile?.confidenceScore || 65), 0) /
        (totalStudents || 1)
    );

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        atRiskCount,
        avgAttendance,
        avgConfidence,
        activeTasksCount: inMemoryTasks.length,
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET Assigned Students
exports.getAssignedStudents = async (req, res) => {
  try {
    const { search, center, atRiskOnly } = req.query;
    const students = await getAllCohortStudents();

    let filtered = [...students];

    if (search) {
      const sLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(sLower) ||
          s.phone?.includes(sLower) ||
          s.email?.toLowerCase().includes(sLower)
      );
    }

    if (center && center !== 'all') {
      filtered = filtered.filter((s) => s.center === center);
    }

    if (atRiskOnly === 'true') {
      filtered = filtered.filter((s) => s.atRisk);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      students: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Record Attendance
exports.recordAttendance = async (req, res) => {
  try {
    const { date, records, center = 'Sangam Vihar CDC', batch = 'Batch 2026-A' } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid date and attendance records array.',
      });
    }

    inMemoryAttendance[date] = records;

    const isDb = mongoose.connection.readyState === 1;

    for (const rec of records) {
      const stId = rec.studentId;
      const status = rec.status || 'present';

      // 1. Update in-memory fallback list
      const target = inMemoryStudents.find((s) => (s._id || s.id) === stId);
      if (target) {
        if (status === 'absent') {
          target.attendanceRate = Math.max(50, (target.attendanceRate || 85) - 3);
        } else if (status === 'present') {
          target.attendanceRate = Math.min(100, (target.attendanceRate || 85) + 1);
        }
        target.atRisk = target.attendanceRate < 75;
        if (target.atRisk) {
          target.riskReason = `Attendance dropped to ${target.attendanceRate}%`;
        }
      }

      // 2. Persist to MongoDB
      if (isDb) {
        try {
          const updateData = {
            studentId: String(stId),
            studentName: rec.studentName || 'Student',
            date,
            sessionDate: new Date(date),
            status,
            center,
            batch,
          };

          if (mongoose.Types.ObjectId.isValid(stId)) {
            updateData.student = stId;
          }

          await Attendance.findOneAndUpdate(
            { studentId: String(stId), date },
            { $set: updateData },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
          );

          // 3. Update Learner User's attendanceRate in MongoDB
          if (mongoose.Types.ObjectId.isValid(stId)) {
            const studentHistory = await Attendance.find({ studentId: String(stId) });
            if (studentHistory.length > 0) {
              const presentCount = studentHistory.filter(
                (r) => r.status === 'present' || r.status === 'late'
              ).length;
              const rate = Math.round((presentCount / studentHistory.length) * 100);

              await User.findByIdAndUpdate(stId, {
                $set: { 'softSkillsProfile.attendanceRate': rate },
              });
            }
          }
        } catch (dbErr) {
          console.error('Error saving attendance to MongoDB:', dbErr.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance for ${records.length} students recorded successfully in database for date ${date}.`,
      date,
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET Attendance for Date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query param required' });
    }

    const isDb = mongoose.connection.readyState === 1;
    let records = [];

    if (isDb) {
      records = await Attendance.find({ date });
    }

    if (!records || records.length === 0) {
      records = inMemoryAttendance[date] || [];
    }

    res.status(200).json({
      success: true,
      date,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Conduct Assessment
exports.submitAssessment = async (req, res) => {
  try {
    const {
      studentId,
      confidenceScore,
      communicationScore,
      workplaceEtiquetteScore,
      interviewReadinessScore,
      remarks,
      badgesAwarded = [],
    } = req.body;

    if (!studentId || confidenceScore === undefined || communicationScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, confidenceScore, and communicationScore.',
      });
    }

    const overall = Math.round(
      (Number(confidenceScore) +
        Number(communicationScore) +
        Number(workplaceEtiquetteScore || 65) +
        Number(interviewReadinessScore || 60)) /
        4
    );

    const student = inMemoryStudents.find((s) => (s._id || s.id) === studentId);
    if (student) {
      student.softSkillsProfile = {
        ...student.softSkillsProfile,
        confidenceScore: Number(confidenceScore),
        communicationScore: Number(communicationScore),
        workplaceEtiquetteScore: Number(workplaceEtiquetteScore || 65),
        interviewReadinessScore: Number(interviewReadinessScore || 60),
        trainerNotes: remarks || student.softSkillsProfile?.trainerNotes,
      };

      if (badgesAwarded.length > 0) {
        student.softSkillsProfile.badgesEarned = Array.from(
          new Set([...(student.softSkillsProfile.badgesEarned || []), ...badgesAwarded])
        );
      }

      if (confidenceScore >= 60 && student.attendanceRate >= 75) {
        student.atRisk = false;
        student.riskReason = '';
      }
    }

    const isDb = mongoose.connection.readyState === 1;
    if (isDb && mongoose.Types.ObjectId.isValid(studentId)) {
      await Assessment.create({
        studentId,
        studentName: student?.name,
        confidenceScore,
        communicationScore,
        workplaceEtiquetteScore,
        interviewReadinessScore,
        overallScore: overall,
        remarks,
        badgesAwarded,
      });

      await User.findByIdAndUpdate(studentId, {
        $set: {
          'softSkillsProfile.confidenceScore': Number(confidenceScore),
          'softSkillsProfile.communicationScore': Number(communicationScore),
          'softSkillsProfile.workplaceEtiquetteScore': Number(workplaceEtiquetteScore),
          'softSkillsProfile.interviewReadinessScore': Number(interviewReadinessScore),
          'softSkillsProfile.trainerNotes': remarks,
        },
        $addToSet: {
          'softSkillsProfile.badgesEarned': { $each: badgesAwarded },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Soft skills developmental assessment recorded and profile updated!',
      overallScore: overall,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Assign Personalized Task
exports.assignTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'Spoken English',
      targetType = 'batch',
      studentId,
      studentName,
      batch = 'Batch 2026-A',
      dueDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const taskId = new mongoose.Types.ObjectId();
    const newTask = {
      id: taskId.toString(),
      _id: taskId,
      title,
      description,
      category,
      targetType,
      studentId: targetType === 'individual' && mongoose.Types.ObjectId.isValid(studentId) ? studentId : undefined,
      studentName: targetType === 'individual' ? studentName : 'All Students in ' + batch,
      batch,
      dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    inMemoryTasks.unshift(newTask);

    const isDb = mongoose.connection.readyState === 1;
    if (isDb) {
      await Task.create({
        _id: taskId,
        title,
        description,
        category,
        targetType,
        studentId: targetType === 'individual' && mongoose.Types.ObjectId.isValid(studentId) ? studentId : undefined,
        studentName: targetType === 'individual' ? studentName : 'All Students in ' + batch,
        batch,
        dueDate: newTask.dueDate,
      });
    }

    res.status(201).json({
      success: true,
      message: `Task "${title}" assigned successfully!`,
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET Tasks
exports.getTasks = async (req, res) => {
  try {
    const isDb = mongoose.connection.readyState === 1;
    let tasks = inMemoryTasks;

    if (isDb) {
      const dbTasks = await Task.find().sort({ createdAt: -1 });
      if (dbTasks.length > 0) {
        tasks = dbTasks;
      }
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET At-Risk Learners
exports.getAtRiskLearners = async (req, res) => {
  try {
    const students = await getAllCohortStudents();
    const atRisk = students
      .filter((s) => s.atRisk)
      .map((s) => ({
        id: s._id || s.id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        center: s.center,
        batch: s.batch,
        attendanceRate: s.attendanceRate || 68,
        confidenceScore: s.softSkillsProfile?.confidenceScore || 52,
        riskReason:
          s.riskReason ||
          `Attendance is ${s.attendanceRate || 68}% (Threshold: 75%) or low confidence.`,
      }));

    res.status(200).json({
      success: true,
      count: atRisk.length,
      atRiskLearners: atRisk,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Resolve At-Risk
exports.resolveAtRisk = async (req, res) => {
  try {
    const { studentId, resolutionNote } = req.body;
    const student = inMemoryStudents.find((s) => (s._id || s.id) === studentId);

    if (student) {
      student.atRisk = false;
      student.riskReason = '';
      student.trainerNotes = `${student.trainerNotes || ''} | Remediation: ${resolutionNote || 'Counselling completed'}`;
    }

    res.status(200).json({
      success: true,
      message: 'Intervention logged and student status updated!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
