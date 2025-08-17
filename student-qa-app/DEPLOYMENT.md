# Deployment Guide for Student Q&A App

## Prerequisites

1. **Supabase Project**: Your app is already configured with Supabase
2. **Gemini API Key**: You'll need a Google Gemini API key
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Environment Variables Setup

Before deploying, you need to set up these environment variables in your hosting platform:

```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
VITE_APP_NAME=Student Q&A App
VITE_APP_VERSION=1.0.0
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Steps:**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add environment variables in the Vercel dashboard
6. Deploy!

**Benefits:**
- Free tier available
- Automatic deployments on Git push
- Global CDN
- Custom domains
- SSL certificates included

### Option 2: Netlify

**Steps:**
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in the Netlify dashboard
6. Deploy!

### Option 3: GitHub Pages

**Steps:**
1. Add this to your `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Run: `npm run deploy`

### Option 4: Firebase Hosting

**Steps:**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## Post-Deployment Checklist

1. **Test the Application**:
   - Verify user registration/login works
   - Test question submission
   - Check LLM integration
   - Test all major features

2. **Security Considerations**:
   - Ensure environment variables are properly set
   - Check Supabase RLS (Row Level Security) policies
   - Verify API rate limits

3. **Performance Optimization**:
   - Enable gzip compression
   - Set up proper caching headers
   - Monitor Core Web Vitals

4. **Monitoring**:
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API usage and costs
   - Set up uptime monitoring

## Custom Domain Setup

### Vercel:
1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Netlify:
1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names (must start with VITE_)
   - Verify no typos in values

3. **CORS Issues**:
   - Update Supabase CORS settings with your domain
   - Check API endpoint configurations

4. **Routing Issues**:
   - Ensure SPA routing is configured (handled by vercel.json/netlify.toml)
   - Test all routes work correctly

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Netlify**: Free tier includes 100GB bandwidth/month
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **Gemini API**: Pay-per-use, typically very low cost for Q&A apps

## Support

If you encounter issues:
1. Check the hosting platform's documentation
2. Review build logs for errors
3. Test locally with `npm run build` first
4. Verify all environment variables are set correctly
