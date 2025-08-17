import { vi, describe, it, expect, beforeEach } from 'vitest';
import { llmService } from './llmService';

// Mock environment variables
vi.mock('../config/llm', () => ({
  GEMINI_API_KEY: 'test_api_key',
  GEMINI_API_URL: 'https://test.api.url',
}));

describe('llmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeQuestion', () => {
    it('analyzes question and returns metadata successfully', async () => {
      const questionText = 'What is the Pythagorean theorem?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.subject).toBeDefined();
      expect(result.metadata!.topic).toBeDefined();
      expect(result.metadata!.difficultyLevel).toBeDefined();
      expect(result.metadata!.gradeLevel).toBeDefined();
      expect(result.metadata!.confidence).toBeGreaterThan(0);
      expect(result.metadata!.confidence).toBeLessThanOrEqual(1);
    });

    it('handles mathematical questions appropriately', async () => {
      const questionText = 'Solve for x: 2x + 5 = 13';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata!.subject).toBe('Mathematics');
      expect(result.metadata!.topic).toMatch(/Algebra|Equations|Linear/);
    });

    it('handles science questions appropriately', async () => {
      const questionText = 'What is the chemical formula for water?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata!.subject).toBe('Science');
      expect(result.metadata!.topic).toMatch(/Chemistry|Chemical|Compounds/);
    });

    it('handles history questions appropriately', async () => {
      const questionText = 'When did World War II end?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata!.subject).toBe('History');
      expect(result.metadata!.topic).toMatch(/World War|War|20th Century/);
    });

    it('handles English/language questions appropriately', async () => {
      const questionText = 'What is a metaphor?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata!.subject).toBe('English');
      expect(result.metadata!.topic).toMatch(/Literature|Language|Figures of Speech/);
    });

    it('returns appropriate difficulty levels', async () => {
      const questions = [
        'What is 2 + 2?',
        'What is the quadratic formula?',
        'Explain quantum mechanics',
      ];
      
      for (const question of questions) {
        const result = await llmService.analyzeQuestion(question);
        expect(result.success).toBe(true);
        expect(['Beginner', 'Intermediate', 'Advanced']).toContain(result.metadata!.difficultyLevel);
      }
    });

    it('returns appropriate grade levels', async () => {
      const questions = [
        'What is a noun?',
        'What is photosynthesis?',
        'What is calculus?',
      ];
      
      for (const question of questions) {
        const result = await llmService.analyzeQuestion(question);
        expect(result.success).toBe(true);
        expect(['Elementary', 'Middle School', 'High School', 'College']).toContain(result.metadata!.gradeLevel);
      }
    });

    it('handles very short questions', async () => {
      const questionText = 'Why?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('handles very long questions', async () => {
      const questionText = 'A'.repeat(1000) + '?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('handles questions with special characters', async () => {
      const questionText = 'What is 2 + 3 * 4 = ? (Show your work)';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('handles questions in different languages', async () => {
      const questionText = '¿Cuál es la capital de España?';
      
      const result = await llmService.analyzeQuestion(questionText);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });
  });

  describe('generateAnswer', () => {
    it('generates answer for question successfully', async () => {
      const questionText = 'What is the capital of France?';
      const subject = 'Geography';
      const topic = 'European Capitals';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(true);
      expect(result.answer).toBeDefined();
      expect(result.answer!.length).toBeGreaterThan(0);
      expect(result.message).toContain('Answer generated successfully');
    });

    it('generates appropriate answers for mathematical questions', async () => {
      const questionText = 'What is 15 * 8?';
      const subject = 'Mathematics';
      const topic = 'Multiplication';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(true);
      expect(result.answer).toBeDefined();
      expect(result.answer!).toContain('120');
    });

    it('generates appropriate answers for science questions', async () => {
      const questionText = 'What is the chemical symbol for gold?';
      const subject = 'Science';
      const topic = 'Chemistry';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(true);
      expect(result.answer).toBeDefined();
      expect(result.answer!).toContain('Au');
    });

    it('handles complex questions appropriately', async () => {
      const questionText = 'Explain the process of photosynthesis in detail';
      const subject = 'Science';
      const topic = 'Biology';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(true);
      expect(result.answer).toBeDefined();
      expect(result.answer!.length).toBeGreaterThan(100); // Should be detailed
    });

    it('handles questions with multiple parts', async () => {
      const questionText = 'What are the three branches of government and their functions?';
      const subject = 'Social Studies';
      const topic = 'Government';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(true);
      expect(result.answer).toBeDefined();
      expect(result.answer!).toContain('Executive');
      expect(result.answer!).toContain('Legislative');
      expect(result.answer!).toContain('Judicial');
    });

    it('provides educational context in answers', async () => {
      const questionText = 'What is the significance of the Declaration of Independence?';
      const subject = 'History';
      const topic = 'American Revolution';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(true);
      expect(result.answer).toBeDefined();
      expect(result.answer!).toContain('Declaration');
      expect(result.answer!).toContain('Independence');
    });

    it('handles edge case questions gracefully', async () => {
      const questionText = '';
      const subject = 'General';
      const topic = 'General';
      
      const result = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unable to generate answer');
    });

    it('maintains consistency in answer quality', async () => {
      const questionText = 'What is gravity?';
      const subject = 'Science';
      const topic = 'Physics';
      
      const result1 = await llmService.generateAnswer(questionText, subject, topic);
      const result2 = await llmService.generateAnswer(questionText, subject, topic);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.answer).toBeDefined();
      expect(result2.answer).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('handles network errors gracefully', async () => {
      // Mock fetch to simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await llmService.analyzeQuestion('Test question');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to simulate API error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      
      const result = await llmService.analyzeQuestion('Test question');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('API error');
    });

    it('handles malformed responses gracefully', async () => {
      // Mock fetch to simulate malformed response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' }),
      });
      
      const result = await llmService.analyzeQuestion('Test question');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid response');
    });
  });

  describe('performance', () => {
    it('responds within reasonable time for simple questions', async () => {
      const startTime = Date.now();
      
      await llmService.analyzeQuestion('What is 2 + 2?');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(10000); // Should respond within 10 seconds
    });

    it('handles multiple concurrent requests', async () => {
      const questions = [
        'What is math?',
        'What is science?',
        'What is history?',
      ];
      
      const promises = questions.map(q => llmService.analyzeQuestion(q));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});
