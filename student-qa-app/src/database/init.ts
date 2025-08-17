import { db, initializeDatabase } from '../config/database';
import { databaseService } from '../services/databaseService';

/**
 * Initialize the database with sample data
 */
export const initializeDatabaseWithSampleData = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing database with sample data...');
    
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connection established');
    
    // Check if sample data already exists
    const userCount = await db.users.count();
    
    if (userCount === 0) {
      console.log('📝 Inserting sample data...');
      
      // Insert sample users
      const sampleUsers = [
        {
          id: 'user_sample_1',
          fullName: 'John Doe',
          mobileNumber: '9876543210',
        },
        {
          id: 'user_sample_2',
          fullName: 'Jane Smith',
          mobileNumber: '9876543211',
        },
      ];
      
      for (const user of sampleUsers) {
        await databaseService.createUser(user);
      }
      
      // Insert sample questions
      const sampleQuestions = [
        {
          id: 'question_sample_1',
          userId: 'user_sample_1',
          questionText: 'How do I solve the quadratic equation x² + 5x + 6 = 0?',
          subject: 'Mathematics',
          topic: 'Algebra',
          difficultyLevel: 'Intermediate' as const,
          gradeLevel: '9th-12th grade',
          status: 'answered' as const,
          answer: 'To solve the quadratic equation x² + 5x + 6 = 0 using the quadratic formula...',
        },
        {
          id: 'question_sample_2',
          userId: 'user_sample_1',
          questionText: 'What is the difference between potential energy and kinetic energy?',
          subject: 'Physics',
          topic: 'Mechanics',
          difficultyLevel: 'Intermediate' as const,
          gradeLevel: '11th-12th grade',
          status: 'pending' as const,
        },
        {
          id: 'question_sample_3',
          userId: 'user_sample_2',
          questionText: 'Explain the process of photosynthesis in plants.',
          subject: 'Biology',
          topic: 'Cell Biology',
          difficultyLevel: 'Beginner' as const,
          gradeLevel: '9th-10th grade',
          status: 'flagged_for_review' as const,
        },
      ];
      
      for (const question of sampleQuestions) {
        await databaseService.createQuestion(question);
      }
      
      // Insert sample LLM analysis
      const sampleAnalysis = [
        {
          questionId: 'question_sample_1',
          metadata: {
            subject: 'Mathematics',
            topic: 'Algebra',
            difficultyLevel: 'Intermediate' as const,
            gradeLevel: '9th-12th grade',
            confidence: 0.85,
          },
          provider: 'mock',
        },
        {
          questionId: 'question_sample_2',
          metadata: {
            subject: 'Physics',
            topic: 'Mechanics',
            difficultyLevel: 'Intermediate' as const,
            gradeLevel: '11th-12th grade',
            confidence: 0.92,
          },
          provider: 'mock',
        },
        {
          questionId: 'question_sample_3',
          metadata: {
            subject: 'Biology',
            topic: 'Cell Biology',
            difficultyLevel: 'Beginner' as const,
            gradeLevel: '9th-10th grade',
            confidence: 0.88,
          },
          provider: 'mock',
        },
      ];
      
      for (const analysis of sampleAnalysis) {
        await databaseService.storeLLMAnalysis(
          analysis.questionId,
          analysis.metadata,
          analysis.provider
        );
      }
      
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('ℹ️  Sample data already exists, skipping...');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Get database status
 */
export const getDatabaseStatus = async (): Promise<{
  isConnected: boolean;
  tables: string[];
  sampleDataExists: boolean;
  stats: any;
}> => {
  try {
    const isConnected = db.isOpen();
    const tables = ['users', 'questions', 'llmAnalysis'];
    const stats = await databaseService.getStats();
    const sampleDataExists = stats.users > 0;
    
    return {
      isConnected,
      tables,
      sampleDataExists,
      stats,
    };
  } catch (error) {
    console.error('Failed to get database status:', error);
    return {
      isConnected: false,
      tables: [],
      sampleDataExists: false,
      stats: { error: 'Failed to get statistics' },
    };
  }
};

/**
 * Reset database (for development/testing)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Resetting database...');
    
    // Clear all tables
    await db.users.clear();
    await db.questions.clear();
    await db.llmAnalysis.clear();
    
    console.log('✅ Database reset completed');
    
    // Reinitialize with sample data
    await initializeDatabaseWithSampleData();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
};

// Export for use in other modules
export { db };
