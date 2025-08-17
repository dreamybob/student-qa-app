import type { User, SignupFormData } from '../types';

// Mock OTP service - in production, this would integrate with SMS service
class AuthService {
  private users: User[] = [];
  private otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to mobile number (mock implementation)
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

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

      // Store OTP
      this.otpStore.set(mobileNumber, { otp, expiresAt });

      // In production, send SMS here
      console.log(`OTP sent to ${mobileNumber}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully to your mobile number',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  // Verify OTP only (without creating user)
  async verifyOTP(mobileNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if OTP exists and is valid
      const storedOTPData = this.otpStore.get(mobileNumber);
      if (!storedOTPData) {
        return {
          success: false,
          message: 'OTP not found. Please request a new OTP.',
        };
      }

      // Check if OTP has expired
      if (Date.now() > storedOTPData.expiresAt) {
        this.otpStore.delete(mobileNumber);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.',
        };
      }

      // Verify OTP
      if (storedOTPData.otp !== otp) {
        return {
          success: false,
          message: 'Invalid OTP. Please check and try again.',
        };
      }

      // OTP is valid, but don't clear it yet (will be cleared when creating user)
      return {
        success: true,
        message: 'OTP verified successfully!',
      };
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

      // First verify OTP
      const otpVerification = await this.verifyOTP(mobileNumber, otp);
      if (!otpVerification.success) {
        return {
          success: false,
          message: otpVerification.message,
        };
      }

      // Check if user already exists
      const existingUser = this.users.find(user => user.mobileNumber === mobileNumber);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this mobile number already exists.',
        };
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fullName,
        mobileNumber,
        createdAt: new Date(),
      };

      // Add user to storage
      this.users.push(newUser);

      // Clear OTP after successful user creation
      this.otpStore.delete(mobileNumber);

      return {
        success: true,
        user: newUser,
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
    return this.users.find(user => user.id === userId) || null;
  }

  // Get user by mobile number
  async getUserByMobile(mobileNumber: string): Promise<User | null> {
    return this.users.find(user => user.mobileNumber === mobileNumber) || null;
  }

  // Clear expired OTPs (cleanup method)
  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [mobileNumber, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(mobileNumber);
      }
    }
  }
}

export const authService = new AuthService();

// Clean up expired OTPs every minute
setInterval(() => {
  authService.cleanupExpiredOTPs();
}, 60 * 1000);
