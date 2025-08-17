import { useState } from 'react';
import type { SignupFormData } from '../../types';
import { authService } from '../../services/authService';
import './SignupForm.css';

interface SignupFormProps {
  onSignupSuccess: (user: any) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    mobileNumber: '',
    otp: '',
  });

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.mobileNumber.trim()) {
      setMessage({ type: 'error', text: 'Please enter your mobile number' });
      return;
    }

    if (!formData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full name' });
      return;
    }

    // Validate Indian mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      setMessage({ type: 'error', text: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await authService.sendOTP(formData.mobileNumber);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setStep('otp');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim()) {
      setMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }

    if (formData.otp.length !== 6) {
      setMessage({ type: 'error', text: 'OTP must be 6 digits' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Verify OTP and create user account in one step
      const result = await authService.verifyOTPAndSignup(formData);
      
      if (result.success && result.user) {
        setMessage({ type: 'success', text: result.message });
        onSignupSuccess(result.user);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Removed unused handleCompleteSignup function

  const handleResendOTP = () => {
    setStep('details');
    setFormData(prev => ({ ...prev, otp: '' }));
    setMessage(null);
  };

  const handleEditPhoneNumber = () => {
    setStep('details');
    setFormData(prev => ({ ...prev, otp: '', fullName: '' }));
    setMessage(null);
  };

  const renderDetailsStep = () => (
    <div className="signup-step">
      <h2>Enter Your Details</h2>
      <p>We'll send you a verification code</p>
      
      <div className="form-group">
        <label htmlFor="mobileNumber">Mobile Number</label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleInputChange}
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          disabled={loading}
        />
        <small>Enter your 10-digit Indian mobile number</small>
      </div>

      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          disabled={loading}
        />
        <small>Enter your complete name as it appears on official documents</small>
      </div>

      <button
        type="button"
        onClick={handleSendOTP}
        disabled={loading || !formData.mobileNumber.trim() || !formData.fullName.trim()}
        className="btn-primary"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </div>
  );

  const renderOTPStep = () => (
    <div className="signup-step">
      <h2>Enter Verification Code</h2>
      <div className="phone-display">
        <p>We've sent a 6-digit code to</p>
        <div className="phone-number-with-edit">
          <span className="phone-number">{formData.mobileNumber}</span>
          <button
            type="button"
            onClick={handleEditPhoneNumber}
            className="edit-phone-btn"
            title="Edit phone number"
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p>for <strong>{formData.fullName}</strong></p>
      </div>
      
      <div className="form-group">
        <label htmlFor="otp">OTP Code</label>
        <input
          type="text"
          id="otp"
          name="otp"
          value={formData.otp}
          onChange={handleInputChange}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          disabled={loading}
        />
        <small>Enter the 6-digit code sent to your mobile</small>
      </div>

      <div className="button-group">
        <button
          type="button"
          onClick={handleVerifyOTP}
          disabled={loading || formData.otp.length !== 6}
          className="btn-primary"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={loading}
          className="btn-secondary"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );

  return (
    <div className="signup-form">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {step === 'details' && renderDetailsStep()}
      {step === 'otp' && renderOTPStep()}
    </div>
  );
};

export default SignupForm;
