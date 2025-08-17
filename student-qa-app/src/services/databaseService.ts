import { db } from '../config/database';
import type { User, Question, QuestionMetadata } from '../types';

/**
 * Database service for CRUD operations using Dexie.js
 */
export class DatabaseService {
  
  // ==================== USER OPERATIONS ====================

  /**
   * Create a new user
   */
  async createUser(user: Omit<User, 'createdAt'>): Promise<User> {
    try {
      const newUser = {
        ...user,
        createdAt: new Date(),
      };
      
      await db.users.add(newUser);
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await db.users.get(userId) || null;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Get user by mobile number
   */
  async getUserByMobile(mobileNumber: string): Promise<User | null> {
    try {
      return await db.users.where('mobileNumber').equals(mobileNumber).first() || null;
    } catch (error) {
      console.error('Failed to get user by mobile:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<Pick<User, 'fullName' | 'mobileNumber'>>): Promise<boolean> {
    try {
      const updatedCount = await db.users.where('id').equals(userId).modify(updates);
      return updatedCount > 0;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const deletedCount = await db.users.where('id').equals(userId).delete();
      return deletedCount > 0;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // ==================== QUESTION OPERATIONS ====================

  /**
   * Create a new question
   */
  async createQuestion(question: Omit<Question, 'createdAt' | 'updatedAt'>): Promise<Question> {
    try {
      const now = new Date();
      const newQuestion = {
        ...question,
        createdAt: now,
        updatedAt: now,
      };
      
      await db.questions.add(newQuestion);
      return newQuestion;
    } catch (error) {
      console.error('Failed to create question:', error);
      throw new Error('Failed to create question');
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      return await db.questions.get(questionId) || null;
    } catch (error) {
      console.error('Failed to get question by ID:', error);
      throw new Error('Failed to get question');
    }
  }

  /**
   * Get questions by user ID
   */
  async getQuestionsByUserId(userId: string): Promise<Question[]> {
    try {
      return await db.questions
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt');
    } catch (error) {
      console.error('Failed to get questions by user ID:', error);
      throw new Error('Failed to get questions');
    }
  }

  /**
   * Update question metadata
   */
  async updateQuestionMetadata(questionId: string, metadata: QuestionMetadata): Promise<boolean> {
    try {
      const updatedCount = await db.questions
        .where('id')
        .equals(questionId)
        .modify({
          subject: metadata.subject,
          topic: metadata.topic,
          difficultyLevel: metadata.difficultyLevel,
          gradeLevel: metadata.gradeLevel,
          updatedAt: new Date(),
        });
      
      return updatedCount > 0;
    } catch (error) {
      console.error('Failed to update question metadata:', error);
      throw new Error('Failed to update question metadata');
    }
  }

  /**
   * Update question status
   */
  async updateQuestionStatus(questionId: string, status: Question['status']): Promise<boolean> {
    try {
      const updatedCount = await db.questions
        .where('id')
        .equals(questionId)
        .modify({
          status,
          updatedAt: new Date(),
        });
      
      return updatedCount > 0;
    } catch (error) {
      console.error('Failed to update question status:', error);
      throw new Error('Failed to update question status');
    }
  }

  /**
   * Update question answer
   */
  async updateQuestionAnswer(questionId: string, answer: string): Promise<boolean> {
    try {
      const updatedCount = await db.questions
        .where('id')
        .equals(questionId)
        .modify({
          answer,
          status: 'answered',
          updatedAt: new Date(),
        });
      
      return updatedCount > 0;
    } catch (error) {
      console.error('Failed to update question answer:', error);
      throw new Error('Failed to update question answer');
    }
  }

  /**
   * Delete question
   */
  async deleteQuestion(questionId: string): Promise<boolean> {
    try {
      const deletedCount = await db.questions.where('id').equals(questionId).delete();
      return deletedCount > 0;
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw new Error('Failed to delete question');
    }
  }

  // ==================== LLM ANALYSIS OPERATIONS ====================

  /**
   * Store LLM analysis results
   */
  async storeLLMAnalysis(
    questionId: string, 
    metadata: QuestionMetadata, 
    provider: string = 'mock'
  ): Promise<boolean> {
    try {
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.llmAnalysis.add({
        id: analysisId,
        questionId,
        subject: metadata.subject,
        topic: metadata.topic,
        difficultyLevel: metadata.difficultyLevel,
        gradeLevel: metadata.gradeLevel,
        confidenceScore: metadata.confidence,
        analysisTimestamp: new Date(),
        llmProvider: provider,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to store LLM analysis:', error);
      throw new Error('Failed to store LLM analysis');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    users: number;
    questions: number;
    llmAnalysis: number;
  }> {
    try {
      const users = await db.users.count();
      const questions = await db.questions.count();
      const llmAnalysis = await db.llmAnalysis.count();
      
      return {
        users,
        questions,
        llmAnalysis,
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw new Error('Failed to get database statistics');
    }
  }

  /**
   * Clean up old data (data retention)
   */
  async cleanupOldData(retentionDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      // Delete old questions that are not answered
      const oldQuestions = await db.questions
        .where('createdAt')
        .below(cutoffDate)
        .and(question => question.status !== 'answered')
        .toArray();
      
      const questionIds = oldQuestions.map(q => q.id);
      await db.questions.bulkDelete(questionIds);
      
      // Delete related LLM analysis
      const oldAnalysis = await db.llmAnalysis
        .where('questionId')
        .anyOf(questionIds)
        .toArray();
      
      const analysisIds = oldAnalysis.map(a => a.id);
      await db.llmAnalysis.bulkDelete(analysisIds);
      
      return questionIds.length;
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      throw new Error('Failed to cleanup old data');
    }
  }

  /**
   * Search questions by text
   */
  async searchQuestions(query: string, userId?: string): Promise<Question[]> {
    try {
      if (userId) {
        return await db.questions
          .where('userId')
          .equals(userId)
          .filter(question => 
            question.questionText.toLowerCase().includes(query.toLowerCase()) ||
            question.subject.toLowerCase().includes(query.toLowerCase()) ||
            question.topic.toLowerCase().includes(query.toLowerCase())
          )
          .reverse()
          .sortBy('createdAt');
      } else {
        return await db.questions
          .filter(question => 
            question.questionText.toLowerCase().includes(query.toLowerCase()) ||
            question.subject.toLowerCase().includes(query.toLowerCase()) ||
            question.topic.toLowerCase().includes(query.toLowerCase())
          )
          .reverse()
          .sortBy('createdAt');
      }
    } catch (error) {
      console.error('Failed to search questions:', error);
      throw new Error('Failed to search questions');
    }
  }

  /**
   * Get questions by status
   */
  async getQuestionsByStatus(status: Question['status'], userId?: string): Promise<Question[]> {
    try {
      if (userId) {
        return await db.questions
          .where('status')
          .equals(status)
          .and(question => question.userId === userId)
          .reverse()
          .sortBy('createdAt');
      } else {
        return await db.questions
          .where('status')
          .equals(status)
          .reverse()
          .sortBy('createdAt');
      }
    } catch (error) {
      console.error('Failed to get questions by status:', error);
      throw new Error('Failed to get questions by status');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
