import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authService } from './authService';
import type { User } from '../types';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('generates a 6-digit OTP', () => {
      const otp = authService.generateOTP();
      
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('generates different OTPs on multiple calls', () => {
      const otp1 = authService.generateOTP();
      const otp2 = authService.generateOTP();
      
      expect(otp1).not.toBe(otp2);
    });

    it('generates OTPs with only digits', () => {
      const otp = authService.generateOTP();
      
      expect(otp).toMatch(/^\d+$/);
      expect(parseInt(otp)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('sendOTP', () => {
    it('generates and stores OTP for valid mobile number', async () => {
      const mobileNumber = '9876543210';
      
      const result = await authService.sendOTP(mobileNumber);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('OTP sent successfully');
      expect(result.otp).toMatch(/^\d{6}$/);
    });

    it('rejects invalid mobile number format', async () => {
      const invalidMobile = '123';
      
      const result = await authService.sendOTP(invalidMobile);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid mobile number format');
    });

    it('rejects mobile number that does not start with 6-9', async () => {
      const invalidMobile = '1234567890';
      
      const result = await authService.sendOTP(invalidMobile);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid mobile number format');
    });

    it('rejects mobile number with wrong length', async () => {
      const invalidMobile = '987654321';
      
      const result = await authService.sendOTP(invalidMobile);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid mobile number format');
    });

    it('stores OTP for later verification', async () => {
      const mobileNumber = '9876543210';
      
      await authService.sendOTP(mobileNumber);
      
      // Try to send OTP again - should get the same OTP
      const result = await authService.sendOTP(mobileNumber);
      expect(result.success).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    it('verifies correct OTP for stored mobile number', async () => {
      const mobileNumber = '9876543210';
      const sendResult = await authService.sendOTP(mobileNumber);
      const otp = sendResult.otp!;
      
      const result = await authService.verifyOTP(mobileNumber, otp);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('OTP verified successfully');
    });

    it('rejects incorrect OTP', async () => {
      const mobileNumber = '9876543210';
      await authService.sendOTP(mobileNumber);
      
      const result = await authService.verifyOTP(mobileNumber, '000000');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('rejects OTP for mobile number without stored OTP', async () => {
      const result = await authService.verifyOTP('9876543210', '123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('No OTP found for this mobile number');
    });

    it('rejects expired OTP', async () => {
      const mobileNumber = '9876543210';
      await authService.sendOTP(mobileNumber);
      
      // Simulate OTP expiration by manipulating the stored data
      const storedData = (authService as any).otpStorage.get(mobileNumber);
      if (storedData) {
        storedData.timestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      }
      
      const result = await authService.verifyOTP(mobileNumber, storedData.otp);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('OTP has expired');
    });
  });

  describe('verifyOTPAndSignup', () => {
    it('creates user account with valid OTP and name', async () => {
      const mobileNumber = '9876543210';
      const fullName = 'John Doe';
      const sendResult = await authService.sendOTP(mobileNumber);
      const otp = sendResult.otp!;
      
      const result = await authService.verifyOTPAndSignup(mobileNumber, otp, fullName);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.mobileNumber).toBe(mobileNumber);
      expect(result.user!.fullName).toBe(fullName);
      expect(result.user!.id).toMatch(/^user_\d+$/);
      expect(result.user!.createdAt).toBeInstanceOf(Date);
    });

    it('rejects signup with invalid OTP', async () => {
      const mobileNumber = '9876543210';
      const fullName = 'John Doe';
      await authService.sendOTP(mobileNumber);
      
      const result = await authService.verifyOTPAndSignup(mobileNumber, '000000', fullName);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('rejects signup with empty name', async () => {
      const mobileNumber = '9876543210';
      const sendResult = await authService.sendOTP(mobileNumber);
      const otp = sendResult.otp!;
      
      const result = await authService.verifyOTPAndSignup(mobileNumber, otp, '');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Full name is required');
    });

    it('rejects signup with whitespace-only name', async () => {
      const mobileNumber = '9876543210';
      const sendResult = await authService.sendOTP(mobileNumber);
      const otp = sendResult.otp!;
      
      const result = await authService.verifyOTPAndSignup(mobileNumber, otp, '   ');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Full name is required');
    });

    it('generates unique user IDs for different users', async () => {
      const mobile1 = '9876543210';
      const mobile2 = '9876543211';
      const name = 'Test User';
      
      const sendResult1 = await authService.sendOTP(mobile1);
      const sendResult2 = await authService.sendOTP(mobile2);
      
      const result1 = await authService.verifyOTPAndSignup(mobile1, sendResult1.otp!, name);
      const result2 = await authService.verifyOTPAndSignup(mobile2, sendResult2.otp!, name);
      
      expect(result1.user!.id).not.toBe(result2.user!.id);
    });
  });

  describe('validateMobileNumber', () => {
    it('validates correct Indian mobile number format', () => {
      const validNumbers = ['9876543210', '6789012345', '7890123456', '8901234567'];
      
      validNumbers.forEach(number => {
        expect(authService.validateMobileNumber(number)).toBe(true);
      });
    });

    it('rejects invalid mobile number formats', () => {
      const invalidNumbers = [
        '1234567890', // starts with 1
        '2345678901', // starts with 2
        '3456789012', // starts with 3
        '4567890123', // starts with 4
        '5678901234', // starts with 5
        '123456789',  // too short
        '12345678901', // too long
        'abcdefghij',  // non-numeric
        '987654321',   // too short
        '98765432101', // too long
      ];
      
      invalidNumbers.forEach(number => {
        expect(authService.validateMobileNumber(number)).toBe(false);
      });
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is logged in', () => {
      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns current user after successful signup', async () => {
      const mobileNumber = '9876543210';
      const fullName = 'John Doe';
      const sendResult = await authService.sendOTP(mobileNumber);
      const otp = sendResult.otp!;
      
      await authService.verifyOTPAndSignup(mobileNumber, otp, fullName);
      
      const user = authService.getCurrentUser();
      expect(user).toBeDefined();
      expect(user!.mobileNumber).toBe(mobileNumber);
      expect(user!.fullName).toBe(fullName);
    });
  });
});
