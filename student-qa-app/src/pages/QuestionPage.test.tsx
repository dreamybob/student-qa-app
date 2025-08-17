import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import QuestionPage from './QuestionPage';

// Mock the questionService
vi.mock('../services/questionService', () => ({
  questionService: {
    submitQuestion: vi.fn(),
  },
}));

// Mock the llmService
vi.mock('../services/llmService', () => ({
  llmService: {
    analyzeQuestion: vi.fn(),
  },
}));

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('QuestionPage', () => {
  const mockOnSubmitQuestion = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the question page correctly', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    expect(screen.getByText('Ask Your Question')).toBeInTheDocument();
    expect(screen.getByText('Get help with your academic questions from experts')).toBeInTheDocument();
  });

  it('renders the QuestionForm component', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    expect(screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit question/i })).toBeInTheDocument();
  });

  it('displays the page title and description', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ask Your Question');
    expect(screen.getByText(/Get help with your academic questions from experts/)).toBeInTheDocument();
  });

  it('has proper page structure and styling', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    const pageContainer = screen.getByText('Ask Your Question').closest('.question-page');
    expect(pageContainer).toBeInTheDocument();
    expect(pageContainer).toHaveClass('question-page');
  });

  it('renders the question form with correct props', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    // Check that the form is rendered with the correct placeholder
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    expect(textarea).toBeInTheDocument();
    
    // Check that the submit button is present
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('handles question submission through the form', async () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    const testQuestion = 'What is the Pythagorean theorem?';
    fireEvent.change(textarea, { target: { value: testQuestion } });
    fireEvent.click(submitButton);
    
    // The form should handle the submission
    await waitFor(() => {
      expect(mockOnSubmitQuestion).toHaveBeenCalledWith({ questionText: testQuestion });
    });
  });

  it('maintains proper page layout and spacing', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    const pageContainer = screen.getByText('Ask Your Question').closest('.question-page');
    expect(pageContainer).toBeInTheDocument();
    
    // Check that the header and form are properly spaced
    const header = screen.getByRole('heading', { level: 2 });
    const form = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    
    expect(header).toBeInTheDocument();
    expect(form).toBeInTheDocument();
  });

  it('passes loading prop to QuestionForm', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /submitting & analyzing\.\.\./i });
    expect(submitButton).toBeDisabled();
  });

  it('passes onSubmitQuestion prop to QuestionForm', () => {
    renderWithRouter(<QuestionPage onSubmitQuestion={mockOnSubmitQuestion} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(textarea, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmitQuestion).toHaveBeenCalledWith({ questionText: 'Test question' });
  });
});
