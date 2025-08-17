import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axvcdtfugisiwfbkvuil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dmNkdGZ1Z2lzaXdmYmt2dWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDA3MTksImV4cCI6MjA3MDkxNjcxOX0.SU0HDkpogUBGKxY9wWlU3cxFDReDK_OzDR0MichY6a0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  QUESTIONS: 'questions',
  LLM_ANALYSIS: 'llm_analysis',
} as const;

// Question status types
export const QUESTION_STATUS = {
  PENDING: 'pending',
  ANSWERED: 'answered',
  FLAGGED_FOR_REVIEW: 'flagged_for_review',
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

// Grade levels
export const GRADE_LEVELS = {
  ELEMENTARY: '1st-5th grade',
  MIDDLE: '6th-8th grade',
  HIGH_SCHOOL: '9th-12th grade',
  COLLEGE: 'College/University',
} as const;

// Default subjects
export const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Literature',
] as const;

// Default topics for each subject
export const SUBJECT_TOPICS: Record<string, string[]> = {
  Mathematics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
  Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Quantum Physics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Human Anatomy'],
  'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Database Systems', 'Web Development'],
  English: ['Grammar', 'Literature', 'Writing', 'Composition', 'Poetry'],
  History: ['World History', 'Ancient History', 'Modern History', 'American History', 'European History'],
  Geography: ['Physical Geography', 'Human Geography', 'Political Geography', 'Economic Geography'],
  Economics: ['Microeconomics', 'Macroeconomics', 'International Economics', 'Development Economics'],
  Literature: ['Fiction', 'Non-fiction', 'Poetry', 'Drama', 'Literary Criticism'],
};

export type QuestionStatus = typeof QUESTION_STATUS[keyof typeof QUESTION_STATUS];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];
export type GradeLevel = typeof GRADE_LEVELS[keyof typeof GRADE_LEVELS];
export type Subject = typeof DEFAULT_SUBJECTS[number];
export type Topic = string;
