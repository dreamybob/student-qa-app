import type { Question, QuestionFormData, User } from '../types';
import { mockLLMService as llmService } from './llmServiceMock';

// Mock question storage - in production, this would be a database
class QuestionService {
  private questions: Question[] = [];
  private questionIdCounter = 1;
  private usersWithSampleData: Set<string> = new Set();

  constructor() {
    // No sample questions in constructor - will be added dynamically
  }

  private addSampleQuestionsForUser(userId: string) {
    if (this.usersWithSampleData.has(userId)) {
      return; // Already added sample data for this user
    }

    const sampleQuestions: Question[] = [
      {
        id: `question_${this.questionIdCounter++}_${Date.now()}`,
        userId: userId,
        questionText: 'How do I solve the quadratic equation x² + 5x + 6 = 0? I need to find the roots using the quadratic formula.',
        subject: 'Mathematics',
        topic: 'Algebra',
        difficultyLevel: 'Intermediate',
        gradeLevel: '9th-12th grade',
        status: 'answered',
        answer: 'To solve the quadratic equation x² + 5x + 6 = 0 using the quadratic formula:\n\n1) First, identify the coefficients:\n   a = 1, b = 5, c = 6\n\n2) Apply the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a\n\n3) Substitute the values:\n   x = (-5 ± √(25 - 24)) / 2\n   x = (-5 ± √1) / 2\n   x = (-5 ± 1) / 2\n\n4) Calculate both solutions:\n   x₁ = (-5 + 1) / 2 = -4 / 2 = -2\n   x₂ = (-5 - 1) / 2 = -6 / 2 = -3\n\nTherefore, the roots are x = -2 and x = -3.\n\nYou can verify by substituting these values back into the original equation.',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T11:45:00'),
      },
      {
        id: `question_${this.questionIdCounter++}_${Date.now()}`,
        userId: userId,
        questionText: 'What is the difference between potential energy and kinetic energy in physics? Can you give me some real-world examples?',
        subject: 'Physics',
        topic: 'Mechanics',
        difficultyLevel: 'Intermediate',
        gradeLevel: '11th-12th grade',
        status: 'pending',
        createdAt: new Date('2024-01-16T14:20:00'),
        updatedAt: new Date('2024-01-16T14:20:00'),
      },
      {
        id: `question_${this.questionIdCounter++}_${Date.now()}`,
        userId: userId,
        questionText: 'Explain the process of photosynthesis in plants. What are the main reactants and products?',
        subject: 'Biology',
        topic: 'Cell Biology',
        difficultyLevel: 'Beginner',
        gradeLevel: '9th-10th grade',
        status: 'flagged_for_review',
        createdAt: new Date('2024-01-17T09:15:00'),
        updatedAt: new Date('2024-01-17T09:15:00'),
      },
    ];

    this.questions.push(...sampleQuestions);
    this.usersWithSampleData.add(userId);
  }

    // Submit a new question
  async submitQuestion(questionData: QuestionFormData, user: User): Promise<{ success: boolean; question?: Question; message: string }> {
    try {
      // Create new question with initial metadata
      const newQuestion: Question = {
        id: `question_${this.questionIdCounter++}_${Date.now()}`,
        userId: user.id,
        questionText: questionData.questionText,
        subject: 'Pending Analysis',
        topic: 'Pending Analysis',
        difficultyLevel: 'Beginner',
        gradeLevel: 'Not Specified',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to storage first
      this.questions.push(newQuestion);

      // Attempt LLM analysis
      try {
        console.log('Starting LLM analysis for question:', questionData.questionText);
        const analysisResult = await llmService.analyzeQuestion(questionData.questionText);
        console.log('LLM analysis result:', analysisResult);
        
        if (analysisResult.success && analysisResult.metadata) {
          // Update question with LLM analysis results
          const updateResult = await this.updateQuestionMetadata(newQuestion.id, analysisResult.metadata);
          console.log('Question metadata updated:', updateResult);
          
          // Generate answer for the question
          console.log('Starting answer generation for question:', newQuestion.id);
          const answerResult = await llmService.generateAnswer(
            questionData.questionText, 
            analysisResult.metadata.subject, 
            analysisResult.metadata.topic
          );
          
          if (answerResult.success && answerResult.answer) {
            // Update question with answer
            const answerUpdateResult = await this.generateAnswerForQuestion(newQuestion.id, answerResult.answer);
            console.log('Answer generated and updated:', answerUpdateResult);
            
            return {
              success: true,
              question: { ...newQuestion, answer: answerResult.answer, status: 'answered' },
              message: `Question submitted and answered successfully! Analyzed as ${analysisResult.metadata.subject} - ${analysisResult.metadata.topic} (${analysisResult.metadata.difficultyLevel} level).`,
            };
          } else {
            // Answer generation failed, but metadata was updated
            console.warn('Answer generation failed:', answerResult.message);
            return {
              success: true,
              question: newQuestion,
              message: `Question submitted successfully! Analyzed as ${analysisResult.metadata.subject} - ${analysisResult.metadata.topic} (${analysisResult.metadata.difficultyLevel} level). Answer will be generated shortly.`,
            };
          }
        } else {
          // LLM analysis failed, but question was saved
          console.warn('LLM analysis failed:', analysisResult.message);
          return {
            success: true,
            question: newQuestion,
            message: `Question submitted successfully! LLM analysis failed: ${analysisResult.message}. Analysis will be completed manually.`,
          };
        }
      } catch (llmError) {
        // LLM analysis failed, but question was saved
        console.error('LLM analysis error:', llmError);
        return {
          success: true,
          question: newQuestion,
          message: 'Question submitted successfully! LLM analysis encountered an error. Analysis will be completed manually.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit question. Please try again.',
      };
    }
  }

  // Get questions by user ID
  async getQuestionsByUserId(userId: string): Promise<Question[]> {
    try {
      // Add sample questions if they haven't been added for this user yet
      if (!this.usersWithSampleData.has(userId)) {
        this.addSampleQuestionsForUser(userId);
      }

      return this.questions
        .filter(question => question.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching user questions:', error);
      return [];
    }
  }

  // Get question by ID
  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      return this.questions.find(question => question.id === questionId) || null;
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
      const question = this.questions.find(q => q.id === questionId);
      if (question) {
        question.subject = metadata.subject;
        question.topic = metadata.topic;
        question.difficultyLevel = metadata.difficultyLevel;
        question.gradeLevel = metadata.gradeLevel;
        question.updatedAt = new Date();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating question metadata:', error);
      return false;
    }
  }

  // Update question status
  async updateQuestionStatus(questionId: string, status: 'pending' | 'answered' | 'flagged_for_review'): Promise<boolean> {
    try {
      const question = this.questions.find(q => q.id === questionId);
      if (question) {
        question.status = status;
        question.updatedAt = new Date();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating question status:', error);
      return false;
    }
  }

  // Generate answer for a question (called by LLM service)
  async generateAnswerForQuestion(questionId: string, answer: string): Promise<boolean> {
    try {
      const question = this.questions.find(q => q.id === questionId);
      if (question) {
        question.answer = answer;
        question.status = 'answered';
        question.updatedAt = new Date();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error generating answer for question:', error);
      return false;
    }
  }

  // Get all questions (for admin/expert view)
  async getAllQuestions(): Promise<Question[]> {
    try {
      return [...this.questions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching all questions:', error);
      return [];
    }
  }

  // Search questions by subject or topic
  async searchQuestions(query: string): Promise<Question[]> {
    try {
      const searchTerm = query.toLowerCase();
      return this.questions.filter(question => 
        question.subject.toLowerCase().includes(searchTerm) ||
        question.topic.toLowerCase().includes(searchTerm) ||
        question.questionText.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  }

  // Clean up old questions (for data retention policy)
  cleanupOldQuestions(retentionDays: number = 7): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      this.questions = this.questions.filter(question => 
        new Date(question.createdAt) > cutoffDate
      );
    } catch (error) {
      console.error('Error cleaning up old questions:', error);
    }
  }
}

export const questionService = new QuestionService();

// Clean up old questions every hour
setInterval(() => {
  questionService.cleanupOldQuestions(7); // 1 week retention
}, 60 * 60 * 1000);
