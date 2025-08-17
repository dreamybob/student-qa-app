import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudentDashboard from './StudentDashboard';
import type { User } from '../../types';

// Mock the questionService module
vi.mock('../../services/questionService', () => ({
  questionService: {
    getQuestionsByUserId: vi.fn(),
  },
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUser: User = {
  id: 'user_123',
  fullName: 'John Doe',
  mobileNumber: '9876543210',
  createdAt: new Date(),
};

const mockQuestions = [
  {
    id: 'question_1',
    userId: 'user_123',
    questionText: 'How do I solve quadratic equations?',
    subject: 'Mathematics',
    topic: 'Algebra',
    difficultyLevel: 'Intermediate' as const,
    gradeLevel: '9th-12th grade',
    status: 'answered' as const,
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T11:45:00'),
  },
  {
    id: 'question_2',
    userId: 'user_123',
    questionText: 'What is photosynthesis?',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficultyLevel: 'Beginner' as const,
    gradeLevel: '9th-10th grade',
    status: 'pending' as const,
    createdAt: new Date('2024-01-16T14:20:00'),
    updatedAt: new Date('2024-01-16T14:20:00'),
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders loading state initially', async () => {
    // Mock the service to return a never-resolving promise
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={vi.fn()} />
    );

    expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
    expect(screen.getByText('Loading your questions...')).toBeInTheDocument();
  });

  it('renders dashboard with questions', async () => {
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockResolvedValue(mockQuestions);

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Your Questions')).toBeInTheDocument();
    });

    expect(screen.getByText('Mathematics - Algebra')).toBeInTheDocument();
    expect(screen.getByText('Biology - Cell Biology')).toBeInTheDocument();
    
    // Check status badges specifically by looking for elements with the status-badge class
    const answeredBadge = screen.getByText('Answered', { selector: '.status-badge' });
    expect(answeredBadge).toHaveClass('status-answered');
    
    const pendingBadge = screen.getByText('Pending', { selector: '.status-badge' });
    expect(pendingBadge).toHaveClass('status-pending');
  });

  it('renders empty state when no questions', async () => {
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockResolvedValue([]);

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('No questions yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Ask Your First Question')).toBeInTheDocument();
  });

  it('displays correct statistics', async () => {
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockResolvedValue(mockQuestions);

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Your Questions')).toBeInTheDocument();
    });

    // Check statistics by looking at the specific stat cards using more specific selectors
    const statCards = screen.getAllByText(/^\d+$/);
    expect(statCards.length).toBeGreaterThanOrEqual(4); // Should have at least 4 stat cards
    
    // Check that the total questions stat shows 2
    const totalQuestionsStat = screen.getByText('2');
    const totalQuestionsCard = totalQuestionsStat.closest('.stat-card');
    expect(totalQuestionsCard).toHaveTextContent('Total Questions');
    
    // Check that answered and pending stats show 1 by looking at the specific stat cards
    // Use getAllByText to get all elements with "Answered" and find the one in the stat card
    const answeredElements = screen.getAllByText('Answered');
    const answeredStatCard = answeredElements.find(el => el.closest('.stat-card'))?.closest('.stat-card');
    expect(answeredStatCard).toBeTruthy();
    const answeredStatValue = answeredStatCard?.querySelector('h3');
    expect(answeredStatValue).toHaveTextContent('1');
    
    // Use getAllByText to get all elements with "Pending" and find the one in the stat card
    const pendingElements = screen.getAllByText('Pending');
    const pendingStatCard = pendingElements.find(el => el.closest('.stat-card'))?.closest('.stat-card');
    expect(pendingStatCard).toBeTruthy();
    const pendingStatValue = pendingStatCard?.querySelector('h3');
    expect(pendingStatValue).toHaveTextContent('1');
    
    // Check that under review shows 0
    const underReviewStatCard = screen.getByText('Under Review').closest('.stat-card');
    const underReviewStatValue = underReviewStatCard?.querySelector('h3');
    expect(underReviewStatValue).toHaveTextContent('0');
  });

  it('handles error state', async () => {
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockRejectedValue(new Error('Failed to load'));

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load your questions. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const mockOnLogout = vi.fn();
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockResolvedValue([]);

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={mockOnLogout} />
    );

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    screen.getByText('Logout').click();
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('navigates to ask question page when button is clicked', async () => {
    const { questionService } = await import('../../services/questionService');
    vi.mocked(questionService.getQuestionsByUserId).mockResolvedValue([]);

    renderWithRouter(
      <StudentDashboard user={mockUser} onLogout={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Ask Your First Question')).toBeInTheDocument();
    });

    screen.getByText('Ask Your First Question').click();
    expect(mockNavigate).toHaveBeenCalledWith('/ask-question');
  });
});
