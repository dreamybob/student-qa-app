# Student Q&A App

A modern web application that helps students get answers to their academic questions using AI-powered analysis and categorization.

## Features

- 🔐 **User Authentication**: Secure signup/login with OTP verification
- 📝 **Question Submission**: Submit academic questions with rich metadata
- 🤖 **AI Analysis**: Automatic categorization and analysis using Google Gemini
- 📊 **Dashboard**: Track your questions and their status
- 🎯 **Smart Categorization**: Automatic subject, topic, and difficulty classification
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (Database + Auth)
- **AI**: Google Gemini API
- **Styling**: CSS3 with modern design patterns
- **Testing**: Vitest + React Testing Library

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Gemini API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd student-qa-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` and add your API keys:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Deployment

### Quick Deployment

Run the deployment script:
```bash
./deploy.sh
```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Choose your hosting platform**:
   - [Vercel](https://vercel.com) (Recommended)
   - [Netlify](https://netlify.com)
   - [GitHub Pages](https://pages.github.com)
   - [Firebase Hosting](https://firebase.google.com/docs/hosting)

3. **Set up environment variables** in your hosting platform:
   - `VITE_GEMINI_API_KEY`
   - `VITE_GEMINI_API_URL`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   └── questions/      # Question-related components
├── config/             # Configuration files
├── database/           # Database setup and migrations
├── pages/              # Page components
├── services/           # API and service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `VITE_GEMINI_API_URL` | Gemini API endpoint | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
2. Review the build logs
3. Ensure all environment variables are set correctly
4. Test locally before deploying
