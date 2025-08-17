import type { Question, QuestionFormData, User, QuestionMetadata } from '../types';
import { mockLLMService as llmService } from './llmServiceMock';
import { supabaseService } from './supabaseService';

// Question service using Supabase
class QuestionService {
  private usersWithSampleData: Set<string> = new Set();

  constructor() {
    // No sample questions in constructor - will be added dynamically
  }

  private async addSampleQuestionsForUser(userId: string) {
    if (this.usersWithSampleData.has(userId)) {
      return; // Already added sample data for this user
    }

    const sampleQuestions: Omit<Question, 'createdAt' | 'updatedAt'>[] = [
      {
        id: `sample_${userId}_1`,
        userId: userId,
        questionText: 'How do I solve the quadratic equation x² + 5x + 6 = 0? I need to find the roots using the quadratic formula.',
        subject: 'Mathematics',
        topic: 'Algebra',
        difficultyLevel: 'Intermediate',
        gradeLevel: '9th-12th grade',
        status: 'answered',
        answer: 'To solve the quadratic equation x² + 5x + 6 = 0 using the quadratic formula:\n\n1) First, identify the coefficients:\n   a = 1, b = 5, c = 6\n\n2) Apply the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a\n\n3) Substitute the values:\n   x = (-5 ± √(25 - 24)) / 2\n   x = (-5 ± √1) / 2\n   x = (-5 ± 1) / 2\n\n4) Calculate both solutions:\n   x₁ = (-5 + 1) / 2 = -4 / 2 = -2\n   x₂ = (-5 - 1) / 2 = -6 / 2 = -3\n\nTherefore, the roots are x = -2 and x = -3.\n\nYou can verify by substituting these values back into the original equation.',
      },
      {
        id: `sample_${userId}_2`,
        userId: userId,
        questionText: 'What is the difference between potential energy and kinetic energy in physics? Can you give me some real-world examples?',
        subject: 'Physics',
        topic: 'Mechanics',
        difficultyLevel: 'Intermediate',
        gradeLevel: '11th-12th grade',
        status: 'pending',
      },
      {
        id: `sample_${userId}_3`,
        userId: userId,
        questionText: 'Explain the process of photosynthesis in plants. What are the main reactants and products?',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficultyLevel: 'Beginner',
        gradeLevel: '9th-10th grade',
        status: 'flagged_for_review',
      },
    ];

    try {
      // Check if sample questions already exist for this user
      const existingQuestions = await supabaseService.getQuestionsByUserId(userId);
      const hasSampleQuestions = existingQuestions.some(q => q.id.startsWith(`sample_${userId}_`));
      
      if (hasSampleQuestions) {
        // Sample questions already exist, mark as having sample data
        this.usersWithSampleData.add(userId);
        console.log('Sample questions already exist for user:', userId);
        return;
      }

      // Add sample questions to Supabase
      for (const question of sampleQuestions) {
        await supabaseService.createQuestion(question);
      }
      this.usersWithSampleData.add(userId);
      console.log('Sample questions added for user:', userId);
    } catch (error) {
      console.error('Failed to add sample questions:', error);
    }
  }

  // Submit a new question
  async submitQuestion(questionData: QuestionFormData, user: User): Promise<{ success: boolean; question?: Question; message: string }> {
    try {
      console.log('QuestionService: Starting question submission for user:', user.id);
      console.log('QuestionService: Question data:', questionData);
      
      // Create new question with initial metadata
      const newQuestion: Omit<Question, 'createdAt' | 'updatedAt'> = {
        id: `user_${user.id}_${Date.now()}`,
        userId: user.id,
        questionText: questionData.questionText,
        subject: 'Pending Analysis',
        topic: 'Pending Analysis',
        difficultyLevel: 'Beginner',
        gradeLevel: '9th-12th grade',
        status: 'pending',
      };

      console.log('QuestionService: Created new question:', newQuestion);

      // Add to Supabase first
      const createdQuestion = await supabaseService.createQuestion(newQuestion);
      if (!createdQuestion) {
        // Check if it's an authentication error
        const isAuth = await supabaseService.isAuthenticated();
        if (!isAuth) {
          throw new Error('User not authenticated. Please sign in again.');
        }
        throw new Error('Failed to create question in database. Please try again.');
      }

      console.log('QuestionService: Added question to Supabase:', createdQuestion);

      // Attempt LLM analysis
      try {
        console.log('Starting LLM analysis for question:', questionData.questionText);
        const analysisResult = await llmService.analyzeQuestion(questionData.questionText);
        console.log('LLM analysis result:', analysisResult);
        
        if (analysisResult.success && analysisResult.metadata) {
          // Update question with LLM analysis results
          const updateResult = await supabaseService.updateQuestionMetadata(createdQuestion.id, analysisResult.metadata as QuestionMetadata);
          console.log('Question metadata updated:', updateResult);
          
          // Store LLM analysis in separate table
          await supabaseService.storeLLMAnalysis(createdQuestion.id, analysisResult.metadata as QuestionMetadata);
          
          // Generate answer for the question
          console.log('Starting answer generation for question:', createdQuestion.id);
          const answerResult = await llmService.generateAnswer(
            questionData.questionText, 
            analysisResult.metadata.subject, 
            analysisResult.metadata.topic
          );
          
          if (answerResult.success && answerResult.answer) {
            // Update question with answer
            const answerUpdateResult = await supabaseService.updateQuestionAnswer(createdQuestion.id, answerResult.answer);
            console.log('Answer generated and updated:', answerUpdateResult);
            
            return {
              success: true,
              question: { ...createdQuestion, answer: answerResult.answer, status: 'answered' },
              message: `Question submitted and answered successfully! Analyzed as ${analysisResult.metadata.subject} - ${analysisResult.metadata.topic} (${analysisResult.metadata.difficultyLevel} level).`,
            };
          } else {
            // Answer generation failed, but metadata was updated
            console.warn('Answer generation failed:', answerResult.message);
            return {
              success: true,
              question: createdQuestion,
              message: `Question submitted successfully! Analyzed as ${analysisResult.metadata.subject} - ${analysisResult.metadata.topic} (${analysisResult.metadata.difficultyLevel} level). Answer will be generated shortly.`,
            };
          }
        } else {
          // LLM analysis failed, but question was saved
          console.warn('LLM analysis failed:', analysisResult.message);
          return {
            success: true,
            question: createdQuestion,
            message: `Question submitted successfully! LLM analysis failed: ${analysisResult.message}. Analysis will be completed manually.`,
          };
        }
      } catch (llmError) {
        // LLM analysis failed, but question was saved
        console.error('LLM analysis error:', llmError);
        return {
          success: true,
          question: createdQuestion,
          message: 'Question submitted successfully! LLM analysis encountered an error. Analysis will be completed manually.',
        };
      }
    } catch (error) {
      console.error('Question submission error:', error);
      return {
        success: false,
        message: 'Failed to submit question. Please try again.',
      };
    }
  }

  // Get questions by user ID
  async getQuestionsByUserId(userId: string): Promise<Question[]> {
    try {
      console.log('QuestionService: Getting questions for user:', userId);
      
      // First, get existing questions from database
      const userQuestions = await supabaseService.getQuestionsByUserId(userId);
      
      // If user has no questions and we haven't added sample data yet, add them
      if (userQuestions.length === 0 && !this.usersWithSampleData.has(userId)) {
        console.log('QuestionService: Adding sample questions for user:', userId);
        await this.addSampleQuestionsForUser(userId);
        
        // Get questions again after adding sample data
        const updatedQuestions = await supabaseService.getQuestionsByUserId(userId);
        console.log('QuestionService: Returning questions for user:', userId, updatedQuestions);
        return updatedQuestions;
      }
      
      console.log('QuestionService: Returning questions for user:', userId, userQuestions);
      return userQuestions;
    } catch (error) {
      console.error('Error fetching user questions:', error);
      return [];
    }
  }

  // Clear the in-memory cache (useful for testing or when user logs out)
  clearCache(): void {
    this.usersWithSampleData.clear();
    console.log('QuestionService: Cache cleared');
  }

  // Get question by ID
  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      return await supabaseService.getQuestionById(questionId);
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  }

  // Update question metadata (called by LLM service)
  async updateQuestionMetadata(questionId: string, metadata: {
    subject: string;
    topic: string;
    difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    gradeLevel: string;
  }): Promise<boolean> {
    try {
      // Add confidence property to metadata if missing
      const metadataWithConfidence: QuestionMetadata = {
        ...metadata,
        confidence: (metadata as any).confidence || 0.8, // Add default confidence if missing
      };
      
      return await supabaseService.updateQuestionMetadata(questionId, metadataWithConfidence);
    } catch (error) {
      console.error('Error updating question metadata:', error);
      return false;
    }
  }

  // Update question status
  async updateQuestionStatus(questionId: string, status: 'pending' | 'answered' | 'flagged_for_review'): Promise<boolean> {
    try {
      return await supabaseService.updateQuestionStatus(questionId, status);
    } catch (error) {
      console.error('Error updating question status:', error);
      return false;
    }
  }

  // Generate answer for question
  async generateAnswerForQuestion(questionId: string, answer: string): Promise<boolean> {
    try {
      return await supabaseService.updateQuestionAnswer(questionId, answer);
    } catch (error) {
      console.error('Error generating answer for question:', error);
      return false;
    }
  }

  // Get all questions (for admin purposes)
  async getAllQuestions(): Promise<Question[]> {
    try {
      return await supabaseService.getAllQuestions();
    } catch (error) {
      console.error('Error fetching all questions:', error);
      return [];
    }
  }

  // Search questions by text
  async searchQuestions(query: string, userId?: string): Promise<Question[]> {
    try {
      return await supabaseService.searchQuestions(query, userId);
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  }

  // Get questions by status
  async getQuestionsByStatus(status: 'pending' | 'answered' | 'flagged_for_review', userId?: string): Promise<Question[]> {
    try {
      return await supabaseService.getQuestionsByStatus(status, userId);
    } catch (error) {
      console.error('Error fetching questions by status:', error);
      return [];
    }
  }

  // Clean up old questions (for data retention policy)
  async cleanupOldQuestions(_retentionDays: number = 7): Promise<void> {
    try {
      // This would need to be implemented in Supabase service
      // For now, we'll skip this as Supabase handles data retention
      console.log('Data retention handled by Supabase');
    } catch (error) {
      console.error('Error cleaning up old questions:', error);
    }
  }

  // Clean up duplicate sample questions (one-time fix)
  async cleanupDuplicateSampleQuestions(userId: string): Promise<void> {
    try {
      const allQuestions = await supabaseService.getQuestionsByUserId(userId);
      
      // Find questions that look like duplicates (same content but different IDs)
      const sampleQuestions = allQuestions.filter(q => 
        q.questionText.includes('quadratic equation') ||
        q.questionText.includes('potential energy and kinetic energy') ||
        q.questionText.includes('photosynthesis in plants')
      );
      
      // Keep only the first occurrence of each sample question
      const seenContent = new Set<string>();
      const questionsToDelete: string[] = [];
      
      for (const question of sampleQuestions) {
        const contentKey = question.questionText.substring(0, 50); // Use first 50 chars as key
        if (seenContent.has(contentKey)) {
          questionsToDelete.push(question.id);
        } else {
          seenContent.add(contentKey);
        }
      }
      
      if (questionsToDelete.length > 0) {
        console.log(`Cleaning up ${questionsToDelete.length} duplicate sample questions for user ${userId}`);
        // Note: This would require a delete method in supabaseService
        // For now, we'll just log the duplicates
        console.log('Duplicate question IDs to delete:', questionsToDelete);
      }
    } catch (error) {
      console.error('Error cleaning up duplicate sample questions:', error);
    }
  }
}

// Export singleton instance
export const questionService = new QuestionService();

// Clean up old questions every hour (optional with Supabase)
setInterval(async () => {
  await questionService.cleanupOldQuestions(7); // 1 week retention
}, 60 * 60 * 1000);
