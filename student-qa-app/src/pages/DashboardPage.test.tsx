import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import DashboardPage from './DashboardPage';
import type { User } from '../../types';

const mockUser: User = {
  id: 'user_123',
  fullName: 'John Doe',
  mobileNumber: '9876543210',
  createdAt: new Date('2024-01-01T00:00:00Z'),
};

const mockOnLogout = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard page wrapper', () => {
    renderWithRouter(<DashboardPage user={mockUser} onLogout={mockOnLogout} />);
    
    // Verify the page wrapper is rendered
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders the student dashboard component', () => {
    renderWithRouter(<DashboardPage user={mockUser} onLogout={mockOnLogout} />);
    
    // Verify the student dashboard is rendered (using the actual component's class)
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(document.querySelector('.student-dashboard')).toBeInTheDocument();
  });

  it('displays the user name in the dashboard', () => {
    renderWithRouter(<DashboardPage user={mockUser} onLogout={mockOnLogout} />);
    
    // Verify the user name is displayed (this comes from the actual StudentDashboard)
    expect(screen.getByText(/Welcome, John Doe!/)).toBeInTheDocument();
  });

  it('has the correct CSS class for page styling', () => {
    const { container } = renderWithRouter(<DashboardPage user={mockUser} onLogout={mockOnLogout} />);
    
    expect(container.firstChild).toHaveClass('dashboard-page');
  });
});
