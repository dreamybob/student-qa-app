import { useState } from 'react';
import type { QuestionFormData } from '../../types';
import './QuestionForm.css';

interface QuestionFormProps {
  onSubmit: (questionData: QuestionFormData) => void;
  loading?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData({ questionText: value });
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate question
    if (!formData.questionText.trim()) {
      setError('Please enter your question');
      return;
    }

    if (formData.questionText.trim().length < 10) {
      setError('Question must be at least 10 characters long');
      return;
    }

    // Submit the question
    onSubmit(formData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow basic math symbols: +, -, *, /, =, (, ), numbers, and text
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta'
    ];
    
    const isAllowedKey = allowedKeys.includes(e.key);
    const isMathSymbol = /[\d+\-*/=()\s\w.,?!]/.test(e.key);
    
    if (!isAllowedKey && !isMathSymbol) {
      e.preventDefault();
    }
  };

  return (
    <div className="question-form">
      <div className="form-header">
        <h2>Ask Your Question</h2>
        <p>Get help with your academic questions from experts</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="questionText">Your Question</label>
          <textarea
            id="questionText"
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here... You can use basic math symbols like +, -, *, /, =, ( )"
            rows={6}
            disabled={loading}
            className={error ? 'error' : ''}
          />
          <small>
            Supports text and basic math notation (+, -, *, /, =, parentheses)
          </small>
          <div className="character-count">
            {formData.questionText.length}/1000 characters
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !formData.questionText.trim()}
            className="btn-submit"
          >
            {loading ? 'Submitting & Analyzing...' : 'Submit Question'}
          </button>
        </div>
        
        {loading && (
          <div className="analysis-status">
            <p>Question submitted! Now analyzing with AI...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
      </form>

      <div className="form-tips">
        <h3>Tips for better questions:</h3>
        <ul>
          <li>Be specific about what you need help with</li>
          <li>Include relevant context or background information</li>
          <li>Use clear language and proper formatting</li>
          <li>For math questions, use the supported symbols</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionForm;
