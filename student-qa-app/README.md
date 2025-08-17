# Student Q&A App

A desktop web-based platform designed to help students post academic questions and receive reliable answers from teachers, peers, and subject matter experts (SMEs).

## Features

- **User Authentication**: Mobile OTP verification system
- **Question Submission**: Text-based questions with basic math notation support
- **LLM Integration**: Automatic question analysis using Gemini API
- **Student Dashboard**: Organized view of questions and answers
- **Smart Categorization**: Automatic subject, topic, difficulty, and grade level detection

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM
- **Styling**: CSS Modules (can be extended with Tailwind)
- **Testing**: Vitest + React Testing Library
- **LLM**: Google Gemini API
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp env.example .env
   ```

4. Add your Gemini API key to `.env`

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── questions/      # Question-related components
│   └── dashboard/      # Dashboard components
├── services/           # API and business logic services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
├── pages/              # Page components
└── test/               # Test setup and utilities
```

## Environment Variables

- `VITE_GEMINI_API_KEY`: Your Gemini API key
- `VITE_GEMINI_API_URL`: Gemini API endpoint
- `VITE_DATABASE_URL`: Database connection string
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
