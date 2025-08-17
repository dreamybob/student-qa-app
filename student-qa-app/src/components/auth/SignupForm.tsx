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

  const [step, setStep] = useState<'mobile' | 'otp' | 'name'>('mobile');
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
      // Just verify OTP, don't create user yet
      const result = await authService.verifyOTP(formData.mobileNumber, formData.otp);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'OTP verified successfully! Please enter your name.' });
        setStep('name');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to verify OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (!formData.fullName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full name' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await authService.verifyOTPAndSignup(formData);
      
      if (result.success && result.user) {
        setMessage({ type: 'success', text: result.message });
        onSignupSuccess(result.user);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to complete signup. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setStep('mobile');
    setFormData(prev => ({ ...prev, otp: '' }));
    setMessage(null);
  };

  const renderMobileStep = () => (
    <div className="signup-step">
      <h2>Enter Your Mobile Number</h2>
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

      <button
        type="button"
        onClick={handleSendOTP}
        disabled={loading || !formData.mobileNumber.trim()}
        className="btn-primary"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </div>
  );

  const renderOTPStep = () => (
    <div className="signup-step">
      <h2>Enter Verification Code</h2>
      <p>We've sent a 6-digit code to {formData.mobileNumber}</p>
      
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

  const renderNameStep = () => (
    <div className="signup-step">
      <h2>Complete Your Profile</h2>
      <p>Please provide your full name to complete registration</p>
      
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
        onClick={handleCompleteSignup}
        disabled={loading || !formData.fullName.trim()}
        className="btn-primary"
      >
        {loading ? 'Creating Account...' : 'Complete Signup'}
      </button>
    </div>
  );

  return (
    <div className="signup-form">
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {step === 'mobile' && renderMobileStep()}
      {step === 'otp' && renderOTPStep()}
      {step === 'name' && renderNameStep()}
    </div>
  );
};

export default SignupForm;
