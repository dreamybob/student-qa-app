import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import QuestionPage from './pages/QuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import DashboardPage from './pages/DashboardPage';
import type { User, QuestionFormData } from './types';
import { questionService } from './services/questionService';
import { getUserFromStorage, saveUserToStorage, clearUserFromStorage } from './utils/authStorage';
import './App.css';

function App() {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState<User | null>(() => getUserFromStorage());
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);

  const handleSignupSuccess = (newUser: User) => {
    setUser(newUser);
    // Save user to localStorage for persistence across refreshes
    saveUserToStorage(newUser);
    console.log('User signed up successfully:', newUser);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear user from localStorage on logout
    clearUserFromStorage();
  };

  const handleSubmitQuestion = async (questionData: QuestionFormData) => {
    if (!user) return;
    
    setIsSubmittingQuestion(true);
    
    try {
      const result = await questionService.submitQuestion(questionData, user);
      if (result.success) {
        console.log('Question submitted successfully:', result.question);
        // Show success message and set redirect flag
        alert(result.message);
        setShouldRedirectToDashboard(true);
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

  // Handle redirect to dashboard after question submission
  useEffect(() => {
    if (shouldRedirectToDashboard) {
      setShouldRedirectToDashboard(false);
      // Use window.location for a simple redirect
      window.location.href = '/';
    }
  }, [shouldRedirectToDashboard]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <DashboardPage 
                  user={user} 
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/signup" replace />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <SignupPage onSignupSuccess={handleSignupSuccess} />
              )
            } 
          />
          <Route 
            path="/ask-question" 
            element={
              user ? (
                <QuestionPage onSubmitQuestion={handleSubmitQuestion} loading={isSubmittingQuestion} />
              ) : (
                <Navigate to="/signup" replace />
              )
            } 
          />
          <Route 
            path="/question/:questionId" 
            element={
              user ? (
                <QuestionDetailPage />
              ) : (
                <Navigate to="/signup" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
