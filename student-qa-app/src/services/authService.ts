import type { User, SignupFormData } from '../types';
import { supabaseService } from './supabaseService';

// Auth service using Supabase
class AuthService {
  // Send OTP to mobile number
  async sendOTP(mobileNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate Indian mobile number format
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobileNumber)) {
        return {
          success: false,
          message: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)',
        };
      }

      // Format phone number for Supabase
      const formattedPhone = this.formatPhoneNumber(mobileNumber);

      // Send OTP via Supabase
      const result = await supabaseService.signUpWithPhone(formattedPhone, 'User');
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  // Verify OTP only (without creating user)
  async verifyOTP(mobileNumber: string, otp: string, fullName?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Format phone number for lookup
      const formattedPhone = this.formatPhoneNumber(mobileNumber);
      
      // Verify OTP with Supabase
      const result = await supabaseService.verifyOTP(formattedPhone, otp, fullName);
      
      if (result.success) {
        return {
          success: true,
          message: 'OTP verified successfully!',
        };
      } else {
        return {
          success: false,
          message: result.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  }

  // Verify OTP and create user account
  async verifyOTPAndSignup(formData: SignupFormData): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const { mobileNumber, otp, fullName } = formData;

      // Format phone number for Supabase
      const formattedPhone = this.formatPhoneNumber(mobileNumber);

      // Check if user already exists
      const existingUser = await supabaseService.getUserByMobile(formattedPhone);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this mobile number already exists.',
        };
      }

      // Create new user using Supabase OTP verification
      // This will establish the Supabase session
      const result = await supabaseService.verifyOTP(formattedPhone, otp, fullName);
      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      // Get the created user from Supabase session
      const createdUser = await supabaseService.getCurrentUser();
      if (!createdUser) {
        return {
          success: false,
          message: 'User created but failed to retrieve user data.',
        };
      }

      return {
        success: true,
        user: createdUser,
        message: 'Account created successfully!',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create account. Please try again.',
      };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    return await supabaseService.getUserById(userId);
  }

  // Get user by mobile number
  async getUserByMobile(mobileNumber: string): Promise<User | null> {
    return await supabaseService.getUserByMobile(mobileNumber);
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<User | null> {
    return await supabaseService.getCurrentUser();
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
}

export const authService = new AuthService();
