// LLM Configuration for Gemini API
export const LLM_CONFIG = {
  // Gemini API configuration
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  API_URL: import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models',
  MODEL: 'gemini-1.5-flash', // Using the latest Gemini model
  
  // API endpoints
  GENERATE_CONTENT: '/generateContent',
  
  // Request configuration
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.1, // Low temperature for consistent categorization
  
  // Response validation
  MIN_CONFIDENCE: 0.9, // 90% confidence threshold as per PRD
  
  // Timeout settings
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Validation function for API key
export const validateLLMConfig = (): boolean => {
  if (!LLM_CONFIG.API_KEY) {
    console.error('LLM API key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    return false;
  }
  
  if (!LLM_CONFIG.API_URL) {
    console.error('LLM API URL is not configured. Please set VITE_GEMINI_API_URL in your environment variables.');
    return false;
  }
  
  return true;
};

// Error messages for different failure scenarios
export const LLM_ERROR_MESSAGES = {
  NO_API_KEY: 'LLM service is not configured. Please contact support.',
  INVALID_REQUEST: 'Invalid request format. Please try again.',
  API_ERROR: 'LLM service is temporarily unavailable. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  LOW_CONFIDENCE: 'Unable to analyze question with sufficient confidence. Please try rephrasing.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
};
