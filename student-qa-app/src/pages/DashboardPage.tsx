import React from 'react';
import type { User } from '../types';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import './DashboardPage.css';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <StudentDashboard user={user} onLogout={onLogout} />
    </div>
  );
};

export default DashboardPage;
