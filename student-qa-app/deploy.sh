#!/bin/bash

# Student Q&A App Deployment Script
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test -- --run

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your app is ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub/GitLab"
    echo "2. Connect your repository to Vercel/Netlify"
    echo "3. Set up environment variables:"
    echo "   - VITE_GEMINI_API_KEY"
    echo "   - VITE_GEMINI_API_URL"
    echo "4. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
