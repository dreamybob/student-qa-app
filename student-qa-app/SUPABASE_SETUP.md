# 🚀 Supabase Setup Guide for Student Q&A App

## 📋 Prerequisites
- Supabase account created
- Project URL: `https://axvcdtfugisiwfbkvuil.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dmNkdGZ1Z2lzaXdmYmt2dWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDA3MTksImV4cCI6MjA3MDkxNjcxOX0.SU0HDkpogUBGKxY9wWlU3cxFDReDK_OzDR0MichY6a0`

## 🗄️ Database Setup

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `axvcdtfugisiwfbkvuil`

### Step 2: Run Database Migration
1. **Navigate to** SQL Editor (left sidebar)
2. **Click** "New Query"
3. **Copy and paste** the entire contents of `supabase-migration.sql`
4. **Click** "Run" button
5. **Verify** all tables are created successfully

### Step 3: Verify Table Creation
After running the migration, you should see:
- ✅ `users` table
- ✅ `questions` table  
- ✅ `llm_analysis` table
- ✅ Row Level Security (RLS) enabled
- ✅ Proper indexes created

## 🔐 Authentication Setup

### Step 1: Enable Phone Auth
1. **Go to** Authentication → Settings
2. **Enable** Phone Auth
3. **Set** Message template (optional):
   ```
   Your OTP code is: {{ .Code }}
   ```

**Important Note**: Supabase requires phone numbers with country codes (e.g., `+919876543210` for India). Our app automatically formats 10-digit Indian numbers to include the `+91` prefix.

### Step 2: Configure RLS Policies
The migration script already sets up RLS policies:
- Users can only see their own data
- Questions are user-scoped
- LLM analysis is linked to user questions

## 🧪 Testing the Setup

### Step 1: Test Database Connection
1. **Open** your app at `http://localhost:5173`
2. **Check browser console** for connection logs
3. **Verify** no database connection errors

### Step 2: Test User Registration
1. **Sign up** with a new mobile number
2. **Verify** user is created in Supabase
3. **Check** `users` table in Supabase dashboard

### Step 3: Test Question Submission
1. **Submit** a test question
2. **Verify** question appears in `questions` table
3. **Check** LLM analysis in `llm_analysis` table

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Table doesn't exist" Error
- **Solution**: Run the migration script again
- **Check**: SQL Editor for any error messages

#### 2. "RLS Policy" Errors
- **Solution**: Verify RLS is enabled on all tables
- **Check**: Table settings in Supabase dashboard

#### 3. "Permission denied" Errors
- **Solution**: Check RLS policies are correctly applied
- **Verify**: User authentication is working

#### 4. "Connection failed" Errors
- **Check**: Environment variables are correct
- **Verify**: Supabase project is active

## 📊 Database Schema Overview

### Users Table
```sql
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  mobile_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Questions Table
```sql
questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_text TEXT NOT NULL,
  subject TEXT DEFAULT 'Pending Analysis',
  topic TEXT DEFAULT 'Pending Analysis',
  difficulty_level difficulty_level DEFAULT 'Beginner',
  grade_level grade_level DEFAULT '9th-12th grade',
  status question_status DEFAULT 'pending',
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### LLM Analysis Table
```sql
llm_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty_level difficulty_level NOT NULL,
  grade_level grade_level NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  llm_provider TEXT DEFAULT 'gemini'
)
```

## 🚀 Next Steps

After successful setup:
1. **Test** all app functionality
2. **Deploy** to Vercel (frontend)
3. **Configure** production environment
4. **Monitor** database performance

## 📞 Support

If you encounter issues:
1. **Check** Supabase logs in dashboard
2. **Verify** environment variables
3. **Test** database connection
4. **Review** RLS policies

---

**🎯 Your Supabase setup is now ready for production use!**
