import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { User, Question } from '../types';

// Database class extending Dexie
export class StudentQADatabase extends Dexie {
  // Define tables
  users!: Table<User>;
  questions!: Table<Question>;
  llmAnalysis!: Table<{
    id: string;
    questionId: string;
    subject: string;
    topic: string;
    difficultyLevel: string;
    gradeLevel: string;
    confidenceScore: number;
    analysisTimestamp: Date;
    llmProvider: string;
  }>;

  constructor() {
    super('StudentQADatabase');
    
    // Define database schema
    this.version(1).stores({
      users: 'id, mobileNumber, fullName, createdAt',
      questions: 'id, userId, status, subject, topic, difficultyLevel, gradeLevel, createdAt, updatedAt',
      llmAnalysis: 'id, questionId, subject, topic, difficultyLevel, gradeLevel, confidenceScore, analysisTimestamp, llmProvider'
    });
  }
}

// Create and export database instance
export const db = new StudentQADatabase();

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<StudentQADatabase> => {
  try {
    // Open database
    await db.open();
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw new Error('Database initialization failed');
  }
};

/**
 * Get database instance
 */
export const getDatabase = (): StudentQADatabase => {
  return db;
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await db.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Failed to close database:', error);
  }
};

/**
 * Check if database is connected
 */
export const isDatabaseConnected = (): boolean => {
  return db.isOpen();
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const userCount = await db.users.count();
    const questionCount = await db.questions.count();
    const analysisCount = await db.llmAnalysis.count();
    
    return {
      users: userCount,
      questions: questionCount,
      llmAnalysis: analysisCount,
      isConnected: isDatabaseConnected(),
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      error: 'Failed to get database statistics',
      isConnected: isDatabaseConnected(),
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
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw new Error('Database reset failed');
  }
};

/**
 * Export database for backup
 */
export const exportDatabase = async (): Promise<{
  users: User[];
  questions: Question[];
  llmAnalysis: any[];
}> => {
  try {
    const users = await db.users.toArray();
    const questions = await db.questions.toArray();
    const llmAnalysis = await db.llmAnalysis.toArray();
    
    return { users, questions, llmAnalysis };
  } catch (error) {
    console.error('Failed to export database:', error);
    throw new Error('Database export failed');
  }
};

/**
 * Import database from backup
 */
export const importDatabase = async (data: {
  users: User[];
  questions: Question[];
  llmAnalysis: any[];
}): Promise<void> => {
  try {
    console.log('📥 Importing database...');
    
    // Clear existing data
    await resetDatabase();
    
    // Import new data
    if (data.users.length > 0) {
      await db.users.bulkAdd(data.users);
    }
    if (data.questions.length > 0) {
      await db.questions.bulkAdd(data.questions);
    }
    if (data.llmAnalysis.length > 0) {
      await db.llmAnalysis.bulkAdd(data.llmAnalysis);
    }
    
    console.log('✅ Database import completed');
  } catch (error) {
    console.error('❌ Database import failed:', error);
    throw new Error('Database import failed');
  }
};

// Initialize database when this module is imported
initializeDatabase().catch(console.error);
