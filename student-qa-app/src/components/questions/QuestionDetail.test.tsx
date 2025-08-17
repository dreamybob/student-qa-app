import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestionDetail from './QuestionDetail';
import type { Question } from '../../types';

// Mock the onBack function
const mockOnBack = vi.fn();

// Mock question data
const mockQuestion: Question = {
  id: 'question_1',
  userId: 'user123',
  questionText: 'What is the capital of France?',
  subject: 'Geography',
  topic: 'European Capitals',
  difficultyLevel: 'Beginner',
  gradeLevel: 'High School',
  status: 'answered',
  answer: 'The capital of France is Paris.',
  createdAt: new Date('2024-01-01T15:30:00Z'),
  updatedAt: new Date('2024-01-01T16:30:00Z'),
};

describe('QuestionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question details correctly', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Geography')).toBeInTheDocument();
    expect(screen.getByText('European Capitals')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('High School')).toBeInTheDocument();
  });

  it('displays the answer when question is answered', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    expect(screen.getByText('AI-Generated Answer')).toBeInTheDocument();
    expect(screen.getByText('The capital of France is Paris.')).toBeInTheDocument();
  });

  it('shows correct status badge for answered question', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    const statusBadge = screen.getByText('Answered');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('status-answered');
  });

  it('shows correct status badge for pending question', () => {
    const pendingQuestion = { ...mockQuestion, status: 'pending' as const };
    render(<QuestionDetail question={pendingQuestion} onBack={mockOnBack} />);
    
    const statusBadge = screen.getByText('Pending');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('status-pending');
  });

  it('shows correct status badge for flagged question', () => {
    const flaggedQuestion = { ...mockQuestion, status: 'flagged_for_review' as const };
    render(<QuestionDetail question={flaggedQuestion} onBack={mockOnBack} />);
    
    const statusBadge = screen.getByText('Under Review');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('status-flagged');
  });

  it('displays formatted dates correctly', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    // Check for the specific "Asked" date, not the answer date
    expect(screen.getByText('Asked:')).toBeInTheDocument();
    expect(screen.getByText(/January 1, 2024 at 09:00 PM/)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    backButton.click();
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('handles question without answer', () => {
    const questionWithoutAnswer = { ...mockQuestion, answer: undefined, status: 'pending' as const };
    render(<QuestionDetail question={questionWithoutAnswer} onBack={mockOnBack} />);
    
    expect(screen.queryByText('AI-Generated Answer')).not.toBeInTheDocument();
    expect(screen.getByText('Your question is being analyzed by our AI...')).toBeInTheDocument();
  });

  it('applies correct difficulty level styling', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    const difficultyElement = screen.getByText('Beginner');
    expect(difficultyElement).toHaveClass('difficulty-badge');
  });

  it('handles different difficulty levels', () => {
    const intermediateQuestion = { ...mockQuestion, difficultyLevel: 'Intermediate' as const };
    render(<QuestionDetail question={intermediateQuestion} onBack={mockOnBack} />);
    
    const difficultyElement = screen.getByText('Intermediate');
    expect(difficultyElement).toHaveClass('difficulty-badge');
  });

  it('displays question metadata in correct format', () => {
    render(<QuestionDetail question={mockQuestion} onBack={mockOnBack} />);
    
    expect(screen.getByText('Geography')).toBeInTheDocument();
    expect(screen.getByText('European Capitals')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('High School')).toBeInTheDocument();
  });
});
