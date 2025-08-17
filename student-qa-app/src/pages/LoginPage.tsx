import LoginForm from '../components/auth/LoginForm';
import type { User } from '../types';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to your Student Q&A account</p>
        </div>
        
        <LoginForm onLoginSuccess={onLoginSuccess} onSwitchToSignup={onSwitchToSignup} />
        
        <div className="login-footer">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
