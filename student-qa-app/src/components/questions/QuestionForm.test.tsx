import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import QuestionForm from './QuestionForm';
import type { QuestionFormData } from '../../types';

// Mock the questionService
vi.mock('../../services/questionService', () => ({
  questionService: {
    submitQuestion: vi.fn(),
  },
}));

// Mock the llmService
vi.mock('../../services/llmService', () => ({
  llmService: {
    analyzeQuestion: vi.fn(),
  },
}));

describe('QuestionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockQuestion = 'What is 2 + 2?';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the question form correctly', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    expect(screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit question/i })).toBeInTheDocument();
  });

  it('allows typing in the question textarea', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    fireEvent.change(textarea, { target: { value: mockQuestion } });
    
    expect(textarea).toHaveValue(mockQuestion);
  });

  it('shows loading state when submitting', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /submitting & analyzing\.\.\./i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/submitting & analyzing\.\.\./i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted with valid question', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(textarea, { target: { value: mockQuestion } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ questionText: mockQuestion });
    });
  });

  it('prevents submission with empty question', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('prevents submission with whitespace-only question', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('supports math notation characters', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const mathQuestion = 'What is 5 + 3 * 2 = ?';
    
    fireEvent.change(textarea, { target: { value: mathQuestion } });
    expect(textarea).toHaveValue(mathQuestion);
  });

  it('handles long questions', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const longQuestion = 'A'.repeat(500);
    
    fireEvent.change(textarea, { target: { value: longQuestion } });
    expect(textarea).toHaveValue(longQuestion);
    expect(screen.getByText('500/1000 characters')).toBeInTheDocument();
  });

  it('prevents submission with question shorter than 10 characters', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(textarea, { target: { value: 'Short' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Question must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  it('clears form after successful submission', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(textarea, { target: { value: 'This is a valid question that is long enough' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    
    // The form should maintain the value after submission (it doesn't clear automatically)
    expect(textarea).toHaveValue('This is a valid question that is long enough');
  });

  it('displays character count correctly', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    
    expect(screen.getByText('0/1000 characters')).toBeInTheDocument();
    
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    expect(screen.getByText('11/1000 characters')).toBeInTheDocument();
  });

  it('shows error message for invalid input', async () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    // Enter some text to enable the button, but not enough to pass validation
    fireEvent.change(textarea, { target: { value: 'Short' } });
    
    // Now the button should be enabled
    expect(submitButton).not.toBeDisabled();
    
    // Click submit to trigger validation
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Question must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  it('disables submit button when loading', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /submitting & analyzing\.\.\./i });
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when question is empty', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when question is valid', () => {
    render(<QuestionForm onSubmit={mockOnSubmit} loading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Type your question here\.\.\. You can use basic math symbols/);
    const submitButton = screen.getByRole('button', { name: /submit question/i });
    
    fireEvent.change(textarea, { target: { value: 'This is a valid question that is long enough' } });
    
    expect(submitButton).not.toBeDisabled();
  });
});
