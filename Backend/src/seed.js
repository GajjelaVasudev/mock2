require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Attendance = require('./models/attendance.model');
const Assessment = require('./models/assessment.model');
const Task = require('./models/task.model');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://syamzeus999_db_user:uH8MrSRVOMWJzjS4@cluster0.98jrdt5.mongodb.net/etasha_db?retryWrites=true&w=majority&appName=Cluster0';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully for seeding.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Trainer Account
    const trainerData = {
      name: 'Sunita Sharma',
      email: 'sunita.trainer@etasha.org',
      phone: '9876543211',
      password: hashedPassword,
      role: 'trainer',
      center: 'Sangam Vihar CDC',
      batch: 'Lead Facilitator - Soft Skills & Spoken English',
      preferredLanguage: 'en',
    };

    const trainer = await User.findOneAndUpdate(
      { $or: [{ email: trainerData.email }, { phone: trainerData.phone }] },
      trainerData,
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Trainer account ready:', trainer.email);

    // 2. Sample Students List
    const sampleStudents = [
      {
        name: 'Pooja Kumari',
        email: 'pooja.learner@etasha.org',
        phone: '9876543210',
        password: hashedPassword,
        role: 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        softSkillsProfile: {
          confidenceScore: 78,
          communicationScore: 82,
          workplaceEtiquetteScore: 85,
          interviewReadinessScore: 74,
          badgesEarned: ['Active Communicator', 'Confidence Champion', 'Punctuality Star'],
          attendanceRate: 92,
          mockInterviewsCompleted: 3,
          trainerNotes: 'High participation in group roleplays. Job ready for retail frontline roles.',
        },
      },
      {
        name: 'Rahul Kumar Sharma',
        email: 'rahul.s@etasha.org',
        phone: '9811223344',
        password: hashedPassword,
        role: 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        softSkillsProfile: {
          confidenceScore: 52,
          communicationScore: 58,
          workplaceEtiquetteScore: 65,
          interviewReadinessScore: 48,
          badgesEarned: ['New Trainee'],
          attendanceRate: 68,
          mockInterviewsCompleted: 1,
          trainerNotes: 'Hesitation during English self-introduction. Needs 1-on-1 coaching.',
        },
      },
      {
        name: 'Anjali Devi',
        email: 'anjali.d@etasha.org',
        phone: '9822334455',
        password: hashedPassword,
        role: 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        softSkillsProfile: {
          confidenceScore: 86,
          communicationScore: 88,
          workplaceEtiquetteScore: 92,
          interviewReadinessScore: 84,
          badgesEarned: ['Active Communicator', 'Customer Service Star', 'Team Leader', 'Interview Star'],
          attendanceRate: 96,
          mockInterviewsCompleted: 4,
          trainerNotes: 'Exceptional communication and professional demeanor. Ready for immediate placement.',
        },
      },
      {
        name: 'Vikas Maurya',
        email: 'vikas.m@etasha.org',
        phone: '9833445566',
        password: hashedPassword,
        role: 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        softSkillsProfile: {
          confidenceScore: 50,
          communicationScore: 54,
          workplaceEtiquetteScore: 60,
          interviewReadinessScore: 44,
          badgesEarned: ['New Trainee'],
          attendanceRate: 64,
          mockInterviewsCompleted: 0,
          trainerNotes: 'Frequent absence due to relocation from resettlement colony. Remedial task assigned.',
        },
      },
      {
        name: 'Kavita Singh',
        email: 'kavita.s@etasha.org',
        phone: '9844556677',
        password: hashedPassword,
        role: 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        softSkillsProfile: {
          confidenceScore: 74,
          communicationScore: 76,
          workplaceEtiquetteScore: 80,
          interviewReadinessScore: 70,
          badgesEarned: ['Punctuality Star', 'Active Communicator'],
          attendanceRate: 88,
          mockInterviewsCompleted: 2,
          trainerNotes: 'Steady improvement in conversational customer dialogue exercises.',
        },
      },
      {
        name: 'Mohit Verma',
        email: 'mohit.v@etasha.org',
        phone: '9855667788',
        password: hashedPassword,
        role: 'learner',
        center: 'Khanpur CDC',
        batch: 'Batch 2026-B',
        softSkillsProfile: {
          confidenceScore: 80,
          communicationScore: 75,
          workplaceEtiquetteScore: 85,
          interviewReadinessScore: 78,
          badgesEarned: ['Customer Service Star', 'Team Leader'],
          attendanceRate: 90,
          mockInterviewsCompleted: 3,
          trainerNotes: 'Strong leadership during peer presentations.',
        },
      },
      {
        name: 'Neetu Kumari',
        email: 'neetu.k@etasha.org',
        phone: '9866778899',
        password: hashedPassword,
        role: 'learner',
        center: 'Dakshinpuri CDC',
        batch: 'Batch 2026-B',
        softSkillsProfile: {
          confidenceScore: 48,
          communicationScore: 52,
          workplaceEtiquetteScore: 70,
          interviewReadinessScore: 50,
          badgesEarned: ['Punctuality Star'],
          attendanceRate: 70,
          mockInterviewsCompleted: 1,
          trainerNotes: 'Shy in group settings. Needs practice in conversational English.',
        },
      },
      {
        name: 'Deepak Verma',
        email: 'deepak@etasha.org',
        phone: '9810098100',
        password: hashedPassword,
        role: 'learner',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        softSkillsProfile: {
          confidenceScore: 72,
          communicationScore: 74,
          workplaceEtiquetteScore: 78,
          interviewReadinessScore: 68,
          badgesEarned: ['Active Communicator'],
          attendanceRate: 86,
          mockInterviewsCompleted: 2,
          trainerNotes: 'Active learner with strong commitment to attending sessions.',
        },
      },
    ];

    // Remove existing sample students first to avoid unique key conflicts
    const sampleEmails = sampleStudents.map((s) => s.email);
    const samplePhones = sampleStudents.map((s) => s.phone);
    await User.deleteMany({
      $or: [{ email: { $in: sampleEmails } }, { phone: { $in: samplePhones } }],
    });

    const insertedStudents = await User.insertMany(sampleStudents);
    console.log(`Successfully seeded ${insertedStudents.length} sample students in MongoDB Atlas.`);

    // 3. Seed Sample Tasks
    const sampleTasks = [
      {
        title: 'Record 30-Second Professional Self-Introduction',
        description: 'Practice state of origin, education, career objective, and why you want to work in retail.',
        category: 'Spoken English',
        targetType: 'batch',
        batch: 'Batch 2026-A',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        title: 'Customer Complaint Handling Roleplay Exercise',
        description: 'Prepare a 2-minute dialogue handling an angry customer returning a defective product with courtesy.',
        category: 'Customer Service Roleplay',
        targetType: 'batch',
        batch: 'Batch 2026-A',
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        title: 'Remedial 1-on-1 English Greeting & Confidence Practice',
        description: 'Practice formal greetings and personal pitch with peer mentor.',
        category: 'Spoken English',
        targetType: 'individual',
        studentId: insertedStudents[1]._id, // Rahul
        studentName: insertedStudents[1].name,
        batch: 'Batch 2026-A',
        dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        title: 'Frontline Retail Cashier & Customer Courtesy Simulation',
        description: 'Roleplay answering price inquiries and greeting shoppers.',
        category: 'Mock Interview',
        targetType: 'batch',
        batch: 'Batch 2026-B',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        status: 'pending',
      },
    ];

    await Task.deleteMany({});
    await Task.insertMany(sampleTasks);
    console.log(`Successfully seeded ${sampleTasks.length} practice tasks.`);

    // 4. Seed Attendance
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = insertedStudents.map((st, idx) => ({
      studentId: st._id,
      studentName: st.name,
      date: today,
      status: idx === 1 || idx === 3 ? 'absent' : idx === 6 ? 'late' : 'present',
      batch: st.batch || 'Batch 2026-A',
      center: st.center || 'Sangam Vihar CDC',
    }));

    await Attendance.deleteMany({ date: today });
    await Attendance.insertMany(attendanceRecords);
    console.log(`Successfully seeded attendance records for ${today}.`);

    // 5. Seed Assessments
    const assessmentRecords = [
      {
        studentId: insertedStudents[0]._id, // Pooja
        studentName: insertedStudents[0].name,
        confidenceScore: 78,
        communicationScore: 82,
        workplaceEtiquetteScore: 85,
        interviewReadinessScore: 74,
        overallScore: 80,
        remarks: 'Active participant in retail customer scenarios.',
        badgesAwarded: ['Active Communicator', 'Confidence Champion'],
      },
      {
        studentId: insertedStudents[2]._id, // Anjali
        studentName: insertedStudents[2].name,
        confidenceScore: 86,
        communicationScore: 88,
        workplaceEtiquetteScore: 92,
        interviewReadinessScore: 84,
        overallScore: 88,
        remarks: 'Excellent articulation and professional demeanor. Ready for placement interviews.',
        badgesAwarded: ['Customer Service Star', 'Team Leader'],
      },
      {
        studentId: insertedStudents[1]._id, // Rahul
        studentName: insertedStudents[1].name,
        confidenceScore: 52,
        communicationScore: 58,
        workplaceEtiquetteScore: 65,
        interviewReadinessScore: 48,
        overallScore: 56,
        remarks: 'Needs support with spoken English fluency and maintaining eye contact.',
        badgesAwarded: ['New Trainee'],
      },
    ];

    await Assessment.deleteMany({});
    await Assessment.insertMany(assessmentRecords);
    console.log(`Successfully seeded sample soft skills assessments.`);

    console.log('Done! All sample student data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
