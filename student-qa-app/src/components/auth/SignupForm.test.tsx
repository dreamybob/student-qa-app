import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignupForm from './SignupForm';

// Mock the authService
vi.mock('../../services/authService', () => ({
  authService: {
    sendOTP: vi.fn(),
    verifyOTP: vi.fn(),
    verifyOTPAndSignup: vi.fn(),
  },
}));

describe('SignupForm', () => {
  const mockOnSignupSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile number input step initially', () => {
    render(<SignupForm onSignupSuccess={mockOnSignupSuccess} />);
    
    expect(screen.getByText('Enter Your Mobile Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter 10-digit mobile number')).toBeInTheDocument();
    expect(screen.getByText('Send OTP')).toBeInTheDocument();
  });

  it('shows error message for empty mobile number', async () => {
    render(<SignupForm onSignupSuccess={mockOnSignupSuccess} />);
    
    // The button should be disabled when there's no mobile number
    const sendOTPButton = screen.getByText('Send OTP');
    expect(sendOTPButton).toBeDisabled();
    
    // Enter an invalid mobile number (too short) to trigger validation
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(mobileInput, { target: { value: '123' } });
    
    // Now the button should be enabled and clicking it should show validation error
    expect(sendOTPButton).toBeEnabled();
    fireEvent.click(sendOTPButton);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid Indian mobile number (10 digits starting with 6-9)')).toBeInTheDocument();
    });
  });

  it('validates mobile number format', async () => {
    render(<SignupForm onSignupSuccess={mockOnSignupSuccess} />);
    
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(mobileInput, { target: { value: '123' } });
    
    const sendOTPButton = screen.getByText('Send OTP');
    fireEvent.click(sendOTPButton);
    
    // Should show validation error for invalid mobile number
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid Indian mobile number (10 digits starting with 6-9)')).toBeInTheDocument();
    });
  });

  it('shows OTP input step after successful OTP send', async () => {
    const { authService } = await import('../../services/authService');
    vi.mocked(authService.sendOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent successfully to your mobile number',
    });

    render(<SignupForm onSignupSuccess={mockOnSignupSuccess} />);
    
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(mobileInput, { target: { value: '9876543210' } });
    
    const sendOTPButton = screen.getByText('Send OTP');
    fireEvent.click(sendOTPButton);
    
    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });
  });

  it('shows name input step after successful OTP verification', async () => {
    const { authService } = await import('../../services/authService');
    
    // Mock sendOTP
    vi.mocked(authService.sendOTP).mockResolvedValue({
      success: true,
      message: 'OTP sent successfully to your mobile number',
    });
    
    // Mock verifyOTP (called first)
    vi.mocked(authService.verifyOTP).mockResolvedValue({
      success: true,
      message: 'OTP verified successfully!',
    });
    
    // Mock verifyOTPAndSignup (called after name input)
    vi.mocked(authService.verifyOTPAndSignup).mockResolvedValue({
      success: true,
      user: { id: '1', fullName: 'Test User', mobileNumber: '9876543210', createdAt: new Date() },
      message: 'Account created successfully!',
    });

    render(<SignupForm onSignupSuccess={mockOnSignupSuccess} />);
    
    // Step 1: Enter mobile number
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(mobileInput, { target: { value: '9876543210' } });
    
    const sendOTPButton = screen.getByText('Send OTP');
    fireEvent.click(sendOTPButton);
    
    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });
    
    // Step 2: Enter OTP
    const otpInput = screen.getByPlaceholderText('Enter 6-digit OTP');
    fireEvent.change(otpInput, { target: { value: '123456' } });
    
    const verifyOTPButton = screen.getByText('Verify OTP');
    fireEvent.click(verifyOTPButton);
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    });
  });
});
