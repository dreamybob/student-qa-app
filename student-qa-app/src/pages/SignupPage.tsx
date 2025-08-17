import SignupForm from '../components/auth/SignupForm';
import type { User } from '../types';
import './SignupPage.css';

interface SignupPageProps {
  onSignupSuccess: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess }) => {
  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Welcome to Student Q&A</h1>
          <p>Get help with your academic questions from experts</p>
        </div>
        
        <SignupForm onSignupSuccess={onSignupSuccess} />
        
        <div className="signup-footer">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
