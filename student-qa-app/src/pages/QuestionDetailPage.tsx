import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Question } from '../types';
import { questionService } from '../services/questionService';
import QuestionDetail from '../components/questions/QuestionDetail';
import './QuestionDetailPage.css';

const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    if (!questionId) return;
    
    try {
      setLoading(true);
      const questionData = await questionService.getQuestionById(questionId);
      
      if (questionData) {
        setQuestion(questionData);
      } else {
        setError('Question not found');
      }
    } catch (err) {
      setError('Failed to load question');
      console.error('Error loading question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="question-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="question-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Question not found'}</p>
          <button onClick={handleBack} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-detail-page">
      <QuestionDetail question={question} onBack={handleBack} />
    </div>
  );
};

export default QuestionDetailPage;
