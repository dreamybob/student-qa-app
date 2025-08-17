import type { QuestionMetadata } from '../types';
import { LLM_CONFIG, validateLLMConfig, LLM_ERROR_MESSAGES } from '../config/llm';

// Gemini API response types
interface GeminiContent {
  parts: Array<{
    text: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: GeminiContent;
    finishReason: string;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;
  };
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
}

class LLMService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = validateLLMConfig();
  }

  // Analyze question and extract metadata
  async analyzeQuestion(questionText: string): Promise<{
    success: boolean;
    metadata?: QuestionMetadata;
    message: string;
  }> {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          message: LLM_ERROR_MESSAGES.NO_API_KEY,
        };
      }

      // Create the prompt for question analysis
      const prompt = this.createAnalysisPrompt(questionText);
      
      // Make API request with retry logic
      const response = await this.makeRequestWithRetry(prompt);
      
      if (!response.success) {
        return response;
      }

      // Parse the response
      if (!response.data) {
        return {
          success: false,
          message: LLM_ERROR_MESSAGES.API_ERROR,
        };
      }
      
      const metadata = this.parseAnalysisResponse(response.data);
      
      if (!metadata) {
        return {
          success: false,
          message: LLM_ERROR_MESSAGES.LOW_CONFIDENCE,
        };
      }

      // Validate confidence threshold
      if (metadata.confidence < LLM_CONFIG.MIN_CONFIDENCE) {
        return {
          success: false,
          message: LLM_ERROR_MESSAGES.LOW_CONFIDENCE,
        };
      }

      return {
        success: true,
        metadata,
        message: 'Question analyzed successfully',
      };
    } catch (error) {
      console.error('LLM analysis error:', error);
      return {
        success: false,
        message: LLM_ERROR_MESSAGES.API_ERROR,
      };
    }
  }

  // Create the analysis prompt
  private createAnalysisPrompt(questionText: string): string {
    return `Analyze the following academic question and extract metadata in JSON format.

Question: "${questionText}"

Please provide a JSON response with the following structure:
{
  "subject": "The main academic subject (e.g., Mathematics, Physics, Chemistry, Biology, History, Literature, Computer Science)",
  "topic": "Specific topic within the subject (e.g., Algebra, Mechanics, Organic Chemistry, Cell Biology, World War II, Shakespeare)",
  "difficultyLevel": "One of: Beginner, Intermediate, Advanced",
  "gradeLevel": "Appropriate grade level (e.g., 9th grade, 12th grade, College, University)",
  "confidence": "Confidence score between 0.0 and 1.0"
}

Guidelines:
- Subject should be a broad academic discipline
- Topic should be specific and relevant to the question
- Difficulty level should reflect the complexity of the question
- Grade level should indicate the appropriate academic level
- Confidence should reflect how certain you are about the categorization
- Only return valid JSON, no additional text or explanations

Response:`;
  }

  // Make API request with retry logic
  private async makeRequestWithRetry(prompt: string, retryCount = 0): Promise<{
    success: boolean;
    data?: GeminiResponse;
    message: string;
  }> {
    try {
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: LLM_CONFIG.TEMPERATURE,
          maxOutputTokens: LLM_CONFIG.MAX_TOKENS,
          topP: 0.8,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      };

      const response = await fetch(
        `${LLM_CONFIG.API_URL}/${LLM_CONFIG.MODEL}${LLM_CONFIG.GENERATE_CONTENT}?key=${LLM_CONFIG.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(LLM_CONFIG.REQUEST_TIMEOUT),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return {
            success: false,
            message: LLM_ERROR_MESSAGES.RATE_LIMIT,
          };
        }
        
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from LLM');
      }

      return {
        success: true,
        data,
        message: 'Request successful',
      };
    } catch (error) {
      console.error(`LLM request attempt ${retryCount + 1} failed:`, error);
      
      // Retry logic
      if (retryCount < LLM_CONFIG.MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, LLM_CONFIG.RETRY_DELAY));
        return this.makeRequestWithRetry(prompt, retryCount + 1);
      }

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          return {
            success: false,
            message: LLM_ERROR_MESSAGES.TIMEOUT,
          };
        }
      }

      return {
        success: false,
        message: LLM_ERROR_MESSAGES.API_ERROR,
      };
    }
  }

  // Parse the LLM response
  private parseAnalysisResponse(response: GeminiResponse): QuestionMetadata | null {
    try {
      const text = response.candidates[0]?.content?.parts[0]?.text;
      
      if (!text) {
        return null;
      }

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.subject || !parsed.topic || !parsed.difficultyLevel || !parsed.gradeLevel || parsed.confidence === undefined) {
        return null;
      }

      // Validate difficulty level
      const validDifficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
      if (!validDifficultyLevels.includes(parsed.difficultyLevel)) {
        return null;
      }

      // Validate confidence
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return null;
      }

      return {
        subject: parsed.subject,
        topic: parsed.topic,
        difficultyLevel: parsed.difficultyLevel as 'Beginner' | 'Intermediate' | 'Advanced',
        gradeLevel: parsed.gradeLevel,
        confidence: parsed.confidence,
      };
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return null;
    }
  }

  // Check if the service is properly configured
  isServiceAvailable(): boolean {
    return this.isConfigured;
  }

  // Get service status
  getServiceStatus(): {
    configured: boolean;
    apiKeyPresent: boolean;
    apiUrlPresent: boolean;
  } {
    return {
      configured: this.isConfigured,
      apiKeyPresent: !!LLM_CONFIG.API_KEY,
      apiUrlPresent: !!LLM_CONFIG.API_URL,
    };
  }
}

export const llmService = new LLMService();
