// User types
export interface User {
  id: string;
  fullName: string;
  mobileNumber: string;
  createdAt: Date;
}

// Question types
export interface Question {
  id: string;
  userId: string;
  questionText: string;
  subject: string;
  topic: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  gradeLevel: string;
  status: 'pending' | 'answered' | 'flagged_for_review';
  answer?: string; // AI-generated answer when status is 'answered'
  createdAt: Date;
  updatedAt: Date;
}

// Answer types
export interface Answer {
  id: string;
  questionId: string;
  expertId: string;
  answerText: string;
  createdAt: Date;
}

// LLM Analysis types
export interface QuestionMetadata {
  subject: string;
  topic: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  gradeLevel: string;
  confidence: number;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Form types
export interface SignupFormData {
  fullName: string;
  mobileNumber: string;
  otp: string;
}

export interface QuestionFormData {
  questionText: string;
}
