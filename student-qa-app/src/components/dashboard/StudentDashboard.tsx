import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, User } from '../../types';
import { questionService } from '../../services/questionService';
import './StudentDashboard.css';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserQuestions();
  }, [user.id]);

  const loadUserQuestions = async () => {
    try {
      setLoading(true);
      const userQuestions = await questionService.getQuestionsByUserId(user.id);
      setQuestions(userQuestions);
    } catch (err) {
      setError('Failed to load your questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskNewQuestion = () => {
    navigate('/ask-question');
  };

  const handleViewQuestion = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  const getStatusBadge = (status: Question['status']) => {
    const statusConfig = {
      pending: { text: 'Pending', className: 'status-pending' },
      answered: { text: 'Answered', className: 'status-answered' },
      flagged_for_review: { text: 'Under Review', className: 'status-review' },
    };

    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user.fullName}!</h1>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user.fullName}!</h1>
          <p>Manage your questions and track their progress</p>
        </div>
        <div className="header-actions">
          <button onClick={handleAskNewQuestion} className="btn-primary">
            Ask New Question
          </button>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadUserQuestions} className="btn-retry">
            Try Again
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{questions.length}</h3>
          <p>Total Questions</p>
        </div>
        <div className="stat-card">
          <h3>{questions.filter(q => q.status === 'answered').length}</h3>
          <p>Answered</p>
        </div>
        <div className="stat-card">
          <h3>{questions.filter(q => q.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{questions.filter(q => q.status === 'flagged_for_review').length}</h3>
          <p>Under Review</p>
        </div>
      </div>

      <div className="questions-section">
        <h2>Your Questions</h2>
        
        {questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No questions yet</h3>
            <p>Start by asking your first question to get help from experts!</p>
            <button onClick={handleAskNewQuestion} className="btn-primary">
              Ask Your First Question
            </button>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map((question) => (
              <div 
                key={question.id} 
                className="question-card"
                onClick={() => handleViewQuestion(question.id)}
              >
                <div className="question-header">
                  <div className="question-meta">
                    <h3>{question.subject} - {question.topic}</h3>
                    <p className="difficulty">
                      {question.difficultyLevel} • {question.gradeLevel}
                    </p>
                  </div>
                  {getStatusBadge(question.status)}
                </div>
                
                <div className="question-content">
                  <p>{truncateText(question.questionText)}</p>
                </div>
                
                <div className="question-footer">
                  <span className="question-date">
                    Asked on {formatDate(question.createdAt)}
                  </span>
                  <span className="question-id">#{question.id.split('_')[1]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
