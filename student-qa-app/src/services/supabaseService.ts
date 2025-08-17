import { supabase, TABLES, QUESTION_STATUS } from '../config/supabase';
import type { User, Question, QuestionMetadata } from '../types';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase service for all database operations
 */
export class SupabaseService {
  
  // ==================== AUTHENTICATION ====================

  /**
   * Sign up user with phone number and OTP
   */
  async signUpWithPhone(phoneNumber: string, fullName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Ensure phone number has country code (+91 for India)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            full_name: fullName,
            mobile_number: formattedPhone,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return {
          success: false,
          message: error.message || 'Failed to send OTP'
        };
      }

      return {
        success: true,
        message: 'OTP sent successfully to your mobile number'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  /**
   * Verify OTP and get user session
   */
  async verifyOTP(phoneNumber: string, otp: string, fullName?: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // Ensure phone number has country code
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('OTP verification error:', error);
        return {
          success: false,
          message: error.message || 'Invalid OTP'
        };
      }

      if (data.user) {
        // Check if user already exists in our users table
        const existingUser = await this.getUserByMobile(formattedPhone);
        
        if (!existingUser) {
          // Create user record in our users table
          const { error: insertError } = await supabase
            .from(TABLES.USERS)
            .insert({
              id: data.user.id,
              full_name: fullName || data.user.user_metadata?.full_name || 'Unknown User',
              mobile_number: formattedPhone,
            });

          if (insertError) {
            console.error('Error creating user record:', insertError);
            // Don't fail the verification, but log the error
          }
        }

        const user: User = {
          id: data.user.id,
          fullName: fullName || data.user.user_metadata?.full_name || 'Unknown User',
          mobileNumber: formattedPhone,
          createdAt: new Date(data.user.created_at),
        };

        return {
          success: true,
          user,
          message: 'OTP verified successfully!'
        };
      }

      return {
        success: false,
        message: 'User not found after OTP verification'
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  /**
   * Format phone number to include country code
   * Assumes Indian numbers (+91) by default
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any existing + or spaces
    const cleanNumber = phoneNumber.replace(/[\s+\-()]/g, '');
    
    // If it already has a country code, return as is
    if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
      return `+${cleanNumber}`;
    }
    
    // If it's a 10-digit Indian number, add +91
    if (cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber)) {
      return `+91${cleanNumber}`;
    }
    
    // If it's already in international format, return as is
    if (cleanNumber.startsWith('+')) {
      return cleanNumber;
    }
    
    // Default: assume it's a 10-digit Indian number
    return `+91${cleanNumber}`;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No authenticated user found');
        return null;
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log('User profile not found in users table');
        return null;
      }

      return {
        id: profile.id,
        fullName: profile.full_name,
        mobileNumber: profile.mobile_number,
        createdAt: new Date(profile.created_at),
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        fullName: data.full_name,
        mobileNumber: data.mobile_number,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Get user by mobile number
   */
  async getUserByMobile(mobileNumber: string): Promise<User | null> {
    try {
      console.log('🔍 Looking for user with mobile:', mobileNumber);
      
      // First try with RLS (normal mode)
      let { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('mobile_number', mobileNumber)
        .single();

      if (error) {
        console.log('❌ RLS query failed:', error);
        
        // If RLS fails, try with service role (debug mode)
        if (error.code === '406' || error.code === 'PGRST116') {
          console.log('🔄 Trying service role query...');
          
          // Create service role client for debugging
          const serviceRoleClient = createClient(
            'https://axvcdtfugisiwfbkvuil.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dmNkdGZ1Z2lzaXdmYmt2dWlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0MDcxOSwiZXhwIjoyMDcwOTE2NzE5fQ.tMkbG8gyGdecDgonHi5ywgLp3YC0MrSQuTopeKzdmi4'
          );
          
          const { data: serviceData, error: serviceError } = await serviceRoleClient
            .from(TABLES.USERS)
            .select('*')
            .eq('mobile_number', mobileNumber)
            .single();
            
          if (serviceError) {
            console.log('❌ Service role query also failed:', serviceError);
            return null;
          }
          
          console.log('✅ Service role query succeeded:', serviceData);
          data = serviceData;
        } else {
          return null;
        }
      }

      if (data) {
        const user: User = {
          id: data.id,
          fullName: data.full_name,
          mobileNumber: data.mobile_number,
          createdAt: new Date(data.created_at),
        };
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error getting user by mobile:', error);
      return null;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        fullName: item.full_name,
        mobileNumber: item.mobile_number,
        createdAt: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw new Error('Failed to get all users');
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Update user error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  // ==================== QUESTION OPERATIONS ====================

  /**
   * Create a new question
   */
  async createQuestion(question: Omit<Question, 'createdAt' | 'updatedAt'>): Promise<Question | null> {
    try {
      // Check if user is authenticated
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        console.error('User not authenticated. Cannot create question.');
        throw new Error('User not authenticated');
      }

      // Get current user to verify ownership
      const currentUser = await this.getCurrentUser();
      if (!currentUser || currentUser.id !== question.userId) {
        console.error('User ID mismatch or user not found');
        throw new Error('User ID mismatch');
      }

      console.log('Creating question for authenticated user:', currentUser.id);

      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .insert({
          user_id: question.userId,
          question_text: question.questionText,
          subject: question.subject,
          topic: question.topic,
          difficulty_level: question.difficultyLevel,
          grade_level: question.gradeLevel,
          status: question.status,
          answer: question.answer,
        })
        .select()
        .single();

      if (error) {
        console.error('Create question error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned after question creation');
        throw new Error('No data returned after question creation');
      }

      console.log('Question created successfully:', data.id);

      return {
        id: data.id,
        userId: data.user_id,
        questionText: data.question_text,
        subject: data.subject,
        topic: data.topic,
        difficultyLevel: data.difficulty_level,
        gradeLevel: data.grade_level,
        status: data.status,
        answer: data.answer,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Create question error:', error);
      return null;
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select('*')
        .eq('id', questionId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        questionText: data.question_text,
        subject: data.subject,
        topic: data.topic,
        difficultyLevel: data.difficulty_level,
        gradeLevel: data.grade_level,
        status: data.status,
        answer: data.answer,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Get question by ID error:', error);
      return null;
    }
  }

  /**
   * Get questions by user ID
   */
  async getQuestionsByUserId(userId: string): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        questionText: item.question_text,
        subject: item.subject,
        topic: item.topic,
        difficultyLevel: item.difficulty_level,
        gradeLevel: item.grade_level,
        status: item.status,
        answer: item.answer,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Get questions by user ID error:', error);
      return [];
    }
  }

  /**
   * Update question metadata
   */
  async updateQuestionMetadata(questionId: string, metadata: QuestionMetadata): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.QUESTIONS)
        .update({
          subject: metadata.subject,
          topic: metadata.topic,
          difficulty_level: metadata.difficultyLevel,
          grade_level: metadata.gradeLevel,
        })
        .eq('id', questionId);

      if (error) {
        console.error('Update question metadata error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update question metadata error:', error);
      return false;
    }
  }

  /**
   * Update question status
   */
  async updateQuestionStatus(questionId: string, status: Question['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.QUESTIONS)
        .update({ status })
        .eq('id', questionId);

      if (error) {
        console.error('Update question status error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update question status error:', error);
      return false;
    }
  }

  /**
   * Update question answer
   */
  async updateQuestionAnswer(questionId: string, answer: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.QUESTIONS)
        .update({
          answer,
          status: QUESTION_STATUS.ANSWERED,
        })
        .eq('id', questionId);

      if (error) {
        console.error('Update question answer error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update question answer error:', error);
      return false;
    }
  }

  /**
   * Get all questions (for admin purposes)
   */
  async getAllQuestions(): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.QUESTIONS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        questionText: item.question_text,
        subject: item.subject,
        topic: item.topic,
        difficultyLevel: item.difficulty_level,
        gradeLevel: item.grade_level,
        status: item.status,
        answer: item.answer,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Get all questions error:', error);
      return [];
    }
  }

  // ==================== LLM ANALYSIS OPERATIONS ====================

  /**
   * Store LLM analysis results
   */
  async storeLLMAnalysis(
    questionId: string,
    metadata: QuestionMetadata,
    provider: string = 'gemini'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.LLM_ANALYSIS)
        .insert({
          question_id: questionId,
          subject: metadata.subject,
          topic: metadata.topic,
          difficulty_level: metadata.difficultyLevel,
          grade_level: metadata.gradeLevel,
          confidence_score: metadata.confidence,
          llm_provider: provider,
        });

      if (error) {
        console.error('Store LLM analysis error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Store LLM analysis error:', error);
      return false;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ users: number; questions: number; llmAnalysis: number }> {
    try {
      const [usersCount, questionsCount, analysisCount] = await Promise.all([
        supabase.from(TABLES.USERS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.QUESTIONS).select('*', { count: 'exact', head: true }),
        supabase.from(TABLES.LLM_ANALYSIS).select('*', { count: 'exact', head: true }),
      ]);

      return {
        users: usersCount.count || 0,
        questions: questionsCount.count || 0,
        llmAnalysis: analysisCount.count || 0,
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return { users: 0, questions: 0, llmAnalysis: 0 };
    }
  }

  /**
   * Search questions by text
   */
  async searchQuestions(query: string, userId?: string): Promise<Question[]> {
    try {
      let queryBuilder = supabase
        .from(TABLES.QUESTIONS)
        .select('*')
        .or(`question_text.ilike.%${query}%,subject.ilike.%${query}%,topic.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }

      const { data, error } = await queryBuilder;

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        questionText: item.question_text,
        subject: item.subject,
        topic: item.topic,
        difficultyLevel: item.difficulty_level,
        gradeLevel: item.grade_level,
        status: item.status,
        answer: item.answer,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Search questions error:', error);
      return [];
    }
  }

  /**
   * Get questions by status
   */
  async getQuestionsByStatus(status: Question['status'], userId?: string): Promise<Question[]> {
    try {
      let queryBuilder = supabase
        .from(TABLES.QUESTIONS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }

      const { data, error } = await queryBuilder;

      if (error || !data) return [];

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        questionText: item.question_text,
        subject: item.subject,
        topic: item.topic,
        difficultyLevel: item.difficulty_level,
        gradeLevel: item.grade_level,
        status: item.status,
        answer: item.answer,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (error) {
      console.error('Get questions by status error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
