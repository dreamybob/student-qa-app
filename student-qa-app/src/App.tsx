import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import QuestionPage from './pages/QuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import DashboardPage from './pages/DashboardPage';
import type { User, QuestionFormData } from './types';
import { questionService } from './services/questionService';
import { supabaseService } from './services/supabaseService';
import { getUserFromStorage, saveUserToStorage, clearUserFromStorage } from './utils/authStorage';
import './App.css';

// Wrapper component to handle navigation
function AppContent() {
  const [user, setUser] = useState<User | null>(() => getUserFromStorage());
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  // Check Supabase authentication state on mount
  useEffect(() => {
    const checkAuthState = async () => {
      const isAuth = await supabaseService.isAuthenticated();
      if (!isAuth && user) {
        // User exists in local storage but not authenticated with Supabase
        console.log('User not authenticated with Supabase, clearing local state');
        setUser(null);
        clearUserFromStorage();
      }
    };

    checkAuthState();
  }, [user]);

  const handleSignupSuccess = (newUser: User) => {
    setUser(newUser);
    saveUserToStorage(newUser);
    console.log('User signed up successfully:', newUser);
  };

  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    saveUserToStorage(newUser);
    console.log('User logged in successfully:', newUser);
  };

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabaseService.signOut();
    // Clear local state
    setUser(null);
    clearUserFromStorage();
    // Clear question service cache
    questionService.clearCache();
  };

  const handleSubmitQuestion = async (questionData: QuestionFormData) => {
    if (!user) return;
    
    setIsSubmittingQuestion(true);
    
    try {
      const result = await questionService.submitQuestion(questionData, user);
      if (result.success) {
        console.log('Question submitted successfully:', result.question);
        alert(result.message);
        setQuestionSubmitted(true);
        // Navigate back to dashboard
        navigate('/');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question. Please try again.');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Reset question submitted flag when navigating to dashboard
  useEffect(() => {
    if (questionSubmitted) {
      setQuestionSubmitted(false);
    }
  }, [questionSubmitted]);

  const switchToSignup = () => {
    setAuthMode('signup');
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <DashboardPage 
                user={user} 
                onLogout={handleLogout}
                refreshTrigger={questionSubmitted}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/auth" 
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              authMode === 'login' ? (
                <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToSignup={switchToSignup} />
              ) : (
                <SignupPage onSignupSuccess={handleSignupSuccess} onSwitchToLogin={switchToLogin} />
              )
            )
          } 
        />
        <Route 
          path="/ask-question" 
          element={
            user ? (
              <QuestionPage onSubmitQuestion={handleSubmitQuestion} loading={isSubmittingQuestion} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        <Route 
          path="/question/:questionId" 
          element={
            user ? (
              <QuestionDetailPage />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
