import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock react-router-dom hooks before importing
const mockUseParams = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: mockUseParams,
    useNavigate: () => mockNavigate,
  };
});

// Mock the questionService
vi.mock('../services/questionService', () => ({
  questionService: {
    getQuestionById: vi.fn(),
  },
}));

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

import { BrowserRouter } from 'react-router-dom';
import QuestionDetailPage from './QuestionDetailPage';
import type { Question } from '../types';
import { questionService } from '../services/questionService';

const renderWithRouter = (questionId: string) => {
  mockUseParams.mockReturnValue({ questionId });
  
  return render(
    <BrowserRouter>
      <QuestionDetailPage />
    </BrowserRouter>
  );
};

describe('QuestionDetailPage', () => {
  const mockQuestion: Question = {
    id: 'q1',
    userId: 'user1',
    questionText: 'What is the capital of France?',
    status: 'answered',
    subject: 'Geography',
    topic: 'European Capitals',
    difficultyLevel: 'Beginner',
    gradeLevel: 'High School',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T11:00:00Z'),
    answer: 'The capital of France is Paris.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ questionId: 'q1' });
  });

  it('renders loading state initially', () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    expect(screen.getByText('Loading question...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('fetches and displays question details', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
      expect(screen.getByText('Geography')).toBeInTheDocument();
      expect(screen.getByText('European Capitals')).toBeInTheDocument();
    });
  });

  it('handles question not found error', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(null);
    
    renderWithRouter('invalid-id');
    
    await waitFor(() => {
      expect(screen.getByText('Question not found')).toBeInTheDocument();
      expect(screen.getByText('The question you are looking for does not exist.')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    vi.mocked(questionService.getQuestionById).mockRejectedValue(new Error('Network error'));
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('Error loading question')).toBeInTheDocument();
      expect(screen.getByText('Failed to load the question. Please try again.')).toBeInTheDocument();
    });
  });

  it('displays back to dashboard button', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to dashboard/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  it('navigates back to dashboard when back button is clicked', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to dashboard/i });
      backButton.click();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('renders question with different statuses', async () => {
    const pendingQuestion = { ...mockQuestion, status: 'pending' as const, answer: undefined };
    vi.mocked(questionService.getQuestionById).mockResolvedValue(pendingQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Your question is being analyzed by our AI...')).toBeInTheDocument();
    });
  });

  it('displays question metadata correctly', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('Geography')).toBeInTheDocument();
      expect(screen.getByText('European Capitals')).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('High School')).toBeInTheDocument();
    });
  });

  it('shows correct timestamps', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText(/January 1, 2024/)).toBeInTheDocument();
    });
  });

  it('handles questions without answers', async () => {
    const questionWithoutAnswer = { ...mockQuestion, answer: undefined, status: 'pending' as const };
    vi.mocked(questionService.getQuestionById).mockResolvedValue(questionWithoutAnswer);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('Your question is being analyzed by our AI...')).toBeInTheDocument();
      expect(screen.queryByText('AI-Generated Answer')).not.toBeInTheDocument();
    });
  });

  it('displays answer when question is answered', async () => {
    vi.mocked(questionService.getQuestionById).mockResolvedValue(mockQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('AI-Generated Answer')).toBeInTheDocument();
      expect(screen.getByText('The capital of France is Paris.')).toBeInTheDocument();
    });
  });

  it('shows correct status badge for different statuses', async () => {
    const flaggedQuestion = { ...mockQuestion, status: 'flagged_for_review' as const };
    vi.mocked(questionService.getQuestionById).mockResolvedValue(flaggedQuestion);
    
    renderWithRouter('q1');
    
    await waitFor(() => {
      expect(screen.getByText('Under Review')).toBeInTheDocument();
    });
  });
});
