import React from 'react';
import type { Question } from '../../types';
import './QuestionDetail.css';

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, onBack }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusBadge = (status: Question['status']) => {
    const statusConfig = {
      answered: { text: 'Answered', className: 'status-answered' },
      pending: { text: 'Pending', className: 'status-pending' },
      flagged_for_review: { text: 'Under Review', className: 'status-flagged' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const difficultyColors = {
      'Beginner': '#28a745',
      'Intermediate': '#ffc107',
      'Advanced': '#dc3545'
    };
    return difficultyColors[difficulty as keyof typeof difficultyColors] || '#6c757d';
  };

  return (
    <div className="question-detail">
      <div className="question-detail-header">
        <button onClick={onBack} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Question Details</h1>
      </div>

      <div className="question-content">
        <div className="question-metadata">
          <div className="metadata-row">
            <div className="metadata-item">
              <label>Subject:</label>
              <span className="subject-tag">{question.subject}</span>
            </div>
            <div className="metadata-item">
              <label>Topic:</label>
              <span className="topic-tag">{question.topic}</span>
            </div>
          </div>
          
          <div className="metadata-row">
            <div className="metadata-item">
              <label>Difficulty:</label>
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(question.difficultyLevel) }}
              >
                {question.difficultyLevel}
              </span>
            </div>
            <div className="metadata-item">
              <label>Grade Level:</label>
              <span className="grade-level">{question.gradeLevel}</span>
            </div>
          </div>

          <div className="metadata-row">
            <div className="metadata-item">
              <label>Status:</label>
              {getStatusBadge(question.status)}
            </div>
            <div className="metadata-item">
              <label>Asked:</label>
              <span className="date">{formatDate(question.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="question-text-section">
          <h3>Your Question</h3>
          <div className="question-text">
            {question.questionText}
          </div>
        </div>

        {question.status === 'answered' && question.answer && (
          <div className="answer-section">
            <h3>AI-Generated Answer</h3>
            <div className="answer-content">
              {question.answer}
            </div>
            <div className="answer-metadata">
              <span className="answer-date">
                Answered on {formatDate(question.updatedAt)}
              </span>
            </div>
          </div>
        )}

        {question.status === 'pending' && (
          <div className="pending-section">
            <div className="pending-indicator">
              <div className="loading-spinner"></div>
              <p>Your question is being analyzed by our AI...</p>
              <p className="pending-note">
                This usually takes 1-3 minutes. You'll receive a notification when the answer is ready.
              </p>
            </div>
          </div>
        )}

        {question.status === 'flagged_for_review' && (
          <div className="flagged-section">
            <div className="flagged-indicator">
              <span className="warning-icon">⚠️</span>
              <h4>Question Under Review</h4>
              <p>
                Your question has been flagged for manual review by our team. 
                This helps us ensure the highest quality of answers.
              </p>
              <p className="review-note">
                You'll receive an answer within 24 hours.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
