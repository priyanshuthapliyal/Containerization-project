import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Department from './src/models/Department.js';
import StudentProfile from './src/models/StudentProfile.js';
import Company from './src/models/Company.js';
import Job from './src/models/Job.js';
import Application from './src/models/Application.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal');
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing database collection records...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await StudentProfile.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared.');

    // 1. Seed Departments
    console.log('Seeding departments...');
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      headOfDept: 'Dr. Alan Turing',
    });

    const eceDept = await Department.create({
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      headOfDept: 'Dr. Claude Shannon',
    });

    console.log('Departments seeded successfully.');

    // 2. Seed Admin User
    console.log('Seeding admin account...');
    await User.create({
      name: 'College Placement Administrator',
      email: 'admin@college.edu',
      password: 'admin123', // Will be hashed by user pre-save hook
      role: 'admin',
      isPasswordReset: true,
      isActive: true,
    });

    // 3. Seed Placement Officer (PO) User
    console.log('Seeding Placement Officer account...');
    await User.create({
      name: 'Officer Jane Smith',
      email: 'po@college.edu',
      password: 'po123456',
      role: 'po',
      isPasswordReset: true,
      isActive: true,
    });

    // 4. Seed Student User and Profile
    console.log('Seeding student account...');
    const studentUser = await User.create({
      name: 'John Doe',
      email: 'student@college.edu',
      password: 'student123', // Student has default credentials
      role: 'student',
      isPasswordReset: false, // Forces password change on first login
      isActive: true,
    });

    await StudentProfile.create({
      userId: studentUser._id,
      rollNumber: '22CSE01',
      departmentId: cseDept._id,
      graduationYear: 2026,
      cgpa: 8.75,
      backlogs: 0,
      skills: ['React', 'Node.js', 'JavaScript', 'Tailwind CSS'],
      resumeUrl: '', // Not uploaded initially
      placementStatus: 'unplaced',
    });

    console.log('Student seeded successfully.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
