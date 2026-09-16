require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Attendance = require('./models/attendance.model');
const Assessment = require('./models/assessment.model');
const Task = require('./models/task.model');
const Center = require('./models/center.model');
const Cohort = require('./models/cohort.model');
const Placement = require('./models/placement.model');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://syamzeus999_db_user:uH8MrSRVOMWJzjS4@cluster0.98jrdt5.mongodb.net/etasha_db?retryWrites=true&w=majority&appName=Cluster0';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Admin User
    const adminData = {
      name: 'Dr. Meenakshi & Impact Team',
      email: 'admin@etasha.org',
      phone: '9876543213',
      password: hashedPassword,
      role: 'admin',
      designation: 'Program & M&E Director',
      center: 'Central HQ',
      preferredLanguage: 'en',
    };
    await User.findOneAndUpdate(
      { email: adminData.email },
      adminData,
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Admin account ready: admin@etasha.org');

    // 2. Seed Trainer User
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
    await User.findOneAndUpdate(
      { email: trainerData.email },
      trainerData,
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Trainer account ready: sunita.trainer@etasha.org');

    // 3. Seed Employer User
    const employerData = {
      name: 'Rajesh Mehra',
      email: 'rajesh.employer@etasha.org',
      phone: '9876543212',
      password: hashedPassword,
      role: 'employer',
      organization: 'Apex Retail Partners',
      designation: 'Head of Talent Acquisition',
      center: 'Central HQ',
      preferredLanguage: 'en',
    };
    await User.findOneAndUpdate(
      { email: employerData.email },
      employerData,
      { upsert: true, returnDocument: 'after' }
    );
    console.log('Employer account ready: rajesh.employer@etasha.org');

    // 4. Seed Training Centers (CDCs)
    const centersData = [
      {
        name: 'Sangam Vihar CDC',
        location: 'Sangam Vihar, South Delhi',
        address: 'B-Block, Gali No. 4, Sangam Vihar, New Delhi - 110080',
        leadTrainer: 'Sunita Sharma',
        capacity: 75,
        activeBatchesCount: 2,
        contactPhone: '011-29987654',
        establishedYear: 2008,
        status: 'active',
      },
      {
        name: 'Khanpur CDC',
        location: 'Khanpur Extension, South Delhi',
        address: 'Main Devli Road, Khanpur, New Delhi - 110062',
        leadTrainer: 'Sunita Sharma',
        capacity: 60,
        activeBatchesCount: 1,
        contactPhone: '011-29987655',
        establishedYear: 2012,
        status: 'active',
      },
      {
        name: 'Dakshinpuri CDC',
        location: 'Dakshinpuri Resettlement Colony',
        address: 'Sector 5, Dakshinpuri, New Delhi - 110062',
        leadTrainer: 'Priya Narang',
        capacity: 60,
        activeBatchesCount: 1,
        contactPhone: '011-29987656',
        establishedYear: 2015,
        status: 'active',
      },
      {
        name: 'Mangolpuri CDC',
        location: 'Mangolpuri, North-West Delhi',
        address: 'Block O, Mangolpuri Industrial Area, Delhi - 110083',
        leadTrainer: 'Ramesh Chander',
        capacity: 50,
        activeBatchesCount: 1,
        contactPhone: '011-29987657',
        establishedYear: 2018,
        status: 'active',
      },
    ];

    await Center.deleteMany({});
    await Center.insertMany(centersData);
    console.log(`Seeded ${centersData.length} training centers.`);

    // 5. Seed Cohorts / Batches
    const cohortsData = [
      {
        name: 'Batch 2026-A',
        courseName: 'Retail & Workplace Soft Skills Readiness',
        center: 'Sangam Vihar CDC',
        trainerName: 'Sunita Sharma',
        startDate: '2026-01-15',
        endDate: '2026-04-30',
        maxCapacity: 30,
        enrolledCount: 5,
        placementTarget: 80,
        status: 'active',
      },
      {
        name: 'Batch 2026-B',
        courseName: 'BPO & Digital Communication Skills',
        center: 'Khanpur CDC',
        trainerName: 'Sunita Sharma',
        startDate: '2026-02-01',
        endDate: '2026-05-15',
        maxCapacity: 25,
        enrolledCount: 2,
        placementTarget: 75,
        status: 'active',
      },
      {
        name: 'Batch 2026-C',
        courseName: 'Customer Care & Front Office Operations',
        center: 'Dakshinpuri CDC',
        trainerName: 'Priya Narang',
        startDate: '2026-02-15',
        endDate: '2026-05-30',
        maxCapacity: 25,
        enrolledCount: 1,
        placementTarget: 80,
        status: 'active',
      },
    ];

    await Cohort.deleteMany({});
    await Cohort.insertMany(cohortsData);
    console.log(`Seeded ${cohortsData.length} cohorts.`);

    // 6. Seed Students (8 Trainees)
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
        batch: 'Batch 2026-C',
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

    const sampleEmails = sampleStudents.map((s) => s.email);
    const samplePhones = sampleStudents.map((s) => s.phone);
    await User.deleteMany({
      $or: [{ email: { $in: sampleEmails } }, { phone: { $in: samplePhones } }],
    });

    const insertedStudents = await User.insertMany(sampleStudents);
    console.log(`Seeded ${insertedStudents.length} students.`);

    // 7. Seed Placements
    const placementsData = [
      {
        studentId: insertedStudents[0]._id, // Pooja
        studentName: insertedStudents[0].name,
        employerName: 'Apex Retail Partners',
        roleTitle: 'Customer Care & Cash Desk Associate',
        sector: 'Retail',
        monthlySalary: 16500,
        placementDate: '2026-03-01',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        status: 'placed',
      },
      {
        studentId: insertedStudents[2]._id, // Anjali
        studentName: insertedStudents[2].name,
        employerName: 'Landmark Hospitality Group',
        roleTitle: 'Front Office Guest Coordinator',
        sector: 'Hospitality',
        monthlySalary: 18000,
        placementDate: '2026-03-05',
        center: 'Sangam Vihar CDC',
        batch: 'Batch 2026-A',
        status: 'placed',
      },
      {
        studentId: insertedStudents[5]._id, // Mohit
        studentName: insertedStudents[5].name,
        employerName: 'TechCare Customer Solutions',
        roleTitle: 'Customer Support Representative',
        sector: 'BPO / Customer Service',
        monthlySalary: 17500,
        placementDate: '2026-03-10',
        center: 'Khanpur CDC',
        batch: 'Batch 2026-B',
        status: 'placed',
      },
    ];

    await Placement.deleteMany({});
    await Placement.insertMany(placementsData);
    console.log(`Seeded ${placementsData.length} corporate placements.`);

    console.log('All Admin & Multi-role sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
