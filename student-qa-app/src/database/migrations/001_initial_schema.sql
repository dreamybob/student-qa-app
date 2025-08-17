-- Migration: 001_initial_schema.sql
-- Description: Initial database schema creation
-- Date: 2024-08-17

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    grade_level TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'flagged_for_review')),
    answer TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    expert_id TEXT,
    confidence_score REAL DEFAULT 0.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE SET NULL
);

-- LLM Analysis Results table
CREATE TABLE IF NOT EXISTS llm_analysis (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    confidence_score REAL NOT NULL DEFAULT 0.0,
    analysis_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    llm_provider TEXT DEFAULT 'mock',
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_llm_analysis_question_id ON llm_analysis(question_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_questions_timestamp 
    AFTER UPDATE ON questions
    BEGIN
        UPDATE questions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_answers_timestamp 
    AFTER UPDATE ON answers
    BEGIN
        UPDATE answers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
