import mongoose from 'mongoose';
import studentModel from '../models/studentModel';
import tutorModel from '../models/tutorModel';
import courseModel from '../models/courseModel';

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sms';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if data already exists
    const existingStudents = await studentModel.countDocuments();
    const existingTutors = await tutorModel.countDocuments();
    const existingCourses = await courseModel.countDocuments();

    if (existingStudents === 0) {
      // Add sample students
      const students = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          mobile: 1234567890,
          password: 'password123',
          isVerified: true,
          is_blocked: false
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          mobile: 9876543210,
          password: 'password123',
          isVerified: true,
          is_blocked: false
        },
        {
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          mobile: 5555555555,
          password: 'password123',
          isVerified: true,
          is_blocked: true
        }
      ];

      await studentModel.insertMany(students);
      console.log('✅ Sample students added');
    } else {
      console.log(`📊 ${existingStudents} students already exist`);
    }

    if (existingTutors === 0) {
      // Add sample tutors
      const tutors = [
        {
          name: 'Dr. Sarah Wilson',
          email: 'sarah.wilson@example.com',
          mobile: 1111111111,
          password: 'password123',
          isVerified: true,
          is_blocked: false
        },
        {
          name: 'Prof. Robert Brown',
          email: 'robert.brown@example.com',
          mobile: 2222222222,
          password: 'password123',
          isVerified: true,
          is_blocked: false
        },
        {
          name: 'Ms. Emily Davis',
          email: 'emily.davis@example.com',
          mobile: 3333333333,
          password: 'password123',
          isVerified: true,
          is_blocked: true
        }
      ];

      await tutorModel.insertMany(tutors);
      console.log('✅ Sample tutors added');
    } else {
      console.log(`📊 ${existingTutors} tutors already exist`);
    }

    if (existingCourses === 0) {
      // Add sample courses
      const courses = [
        {
          courseTitle: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript',
          imageUrl: 'https://via.placeholder.com/300x200?text=Web+Dev',
          regularPrice: 99.99,
          adminId: '689dda607a86bcff6512bb0c', // Use the admin ID from your system
          buyCount: 0
        },
        {
          courseTitle: 'Advanced JavaScript',
          description: 'Master modern JavaScript concepts and frameworks',
          imageUrl: 'https://via.placeholder.com/300x200?text=JavaScript',
          regularPrice: 149.99,
          adminId: '689dda607a86bcff6512bb0c',
          buyCount: 0
        }
      ];

      await courseModel.insertMany(courses);
      console.log('✅ Sample courses added');
    } else {
      console.log(`📊 ${existingCourses} courses already exist`);
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
