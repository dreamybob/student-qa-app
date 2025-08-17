-- Supabase Migration Script for Student Q&A App
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom types for better data validation
CREATE TYPE question_status AS ENUM ('pending', 'answered', 'flagged_for_review');
CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE grade_level AS ENUM ('1st-5th grade', '6th-8th grade', '9th-12th grade', 'College/University');

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    mobile_number TEXT UNIQUE NOT NULL, -- Will store +919876543210 format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    subject TEXT DEFAULT 'Pending Analysis',
    topic TEXT DEFAULT 'Pending Analysis',
    difficulty_level difficulty_level DEFAULT 'Beginner',
    grade_level grade_level DEFAULT '9th-12th grade',
    status question_status DEFAULT 'pending',
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LLM analysis table
CREATE TABLE IF NOT EXISTS public.llm_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty_level difficulty_level NOT NULL,
    grade_level grade_level NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    llm_provider TEXT DEFAULT 'gemini'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_llm_analysis_question_id ON public.llm_analysis(question_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for questions table
CREATE POLICY "Users can view their own questions" ON public.questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions" ON public.questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON public.questions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for LLM analysis table
CREATE POLICY "Users can view analysis for their questions" ON public.llm_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.questions 
            WHERE questions.id = llm_analysis.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert analysis" ON public.llm_analysis
    FOR INSERT WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, mobile_number)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'mobile_number')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.questions TO anon, authenticated;
GRANT ALL ON public.llm_analysis TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Optional: Insert sample data for testing (with proper country code format)
-- Commented out to prevent conflicts - uncomment if you want sample data
-- INSERT INTO public.users (id, full_name, mobile_number) VALUES 
--     (gen_random_uuid(), 'Sample User', '+919876543210')
-- ON CONFLICT DO NOTHING;
