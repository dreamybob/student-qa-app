import type { QuestionMetadata } from '../types';

// Mock LLM service for testing purposes
class MockLLMService {
  // Analyze question and extract metadata (mock implementation)
  async analyzeQuestion(questionText: string): Promise<{
    success: boolean;
    metadata?: QuestionMetadata;
    message: string;
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simple keyword-based categorization for testing
      const metadata = this.mockAnalysis(questionText);
      
      if (metadata) {
        return {
          success: true,
          metadata,
          message: 'Question analyzed successfully (mock)',
        };
      } else {
        return {
          success: false,
          message: 'Unable to categorize question with sufficient confidence',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Mock LLM service error',
      };
    }
  }

  // Mock analysis based on keywords
  private mockAnalysis(questionText: string): QuestionMetadata | null {
    const text = questionText.toLowerCase();
    console.log('Mock LLM analyzing question:', questionText);
    
    // Subject detection
    let subject = 'General';
    let topic = 'General';
    let difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    let gradeLevel = 'High School';
    
    // Math detection
    if (text.includes('math') || text.includes('calculate') || text.includes('equation') || 
        text.includes('+') || text.includes('-') || text.includes('*') || text.includes('/') ||
        text.includes('algebra') || text.includes('geometry') || text.includes('calculus')) {
      subject = 'Mathematics';
      
      if (text.includes('algebra') || text.includes('equation')) {
        topic = 'Algebra';
        difficultyLevel = 'Intermediate';
        gradeLevel = '9th-12th grade';
      } else if (text.includes('calculus') || text.includes('derivative')) {
        topic = 'Calculus';
        difficultyLevel = 'Advanced';
        gradeLevel = 'College';
      } else if (text.includes('geometry')) {
        topic = 'Geometry';
        difficultyLevel = 'Intermediate';
        gradeLevel = '9th-12th grade';
      } else {
        topic = 'Basic Math';
        difficultyLevel = 'Beginner';
        gradeLevel = '6th-8th grade';
      }
    }
    
    // Science detection
    else if (text.includes('physics') || text.includes('force') || text.includes('energy') || text.includes('motion')) {
      subject = 'Physics';
      topic = 'Mechanics';
      difficultyLevel = 'Intermediate';
      gradeLevel = '11th-12th grade';
    }
    else if (text.includes('chemistry') || text.includes('molecule') || text.includes('reaction') || text.includes('chain reaction')) {
      subject = 'Chemistry';
      topic = 'Chemical Reactions';
      difficultyLevel = 'Intermediate';
      gradeLevel = '10th-11th grade';
    }
    else if (text.includes('biology') || text.includes('cell') || text.includes('organism')) {
      subject = 'Biology';
      topic = 'Cell Biology';
      difficultyLevel = 'Intermediate';
      gradeLevel = '9th-10th grade';
    }
    
    // History detection
    else if (text.includes('history') || text.includes('war') || text.includes('ancient') || text.includes('civilization')) {
      subject = 'History';
      topic = 'World History';
      difficultyLevel = 'Beginner';
      gradeLevel = '9th-12th grade';
    }
    
    // Literature detection
    else if (text.includes('literature') || text.includes('book') || text.includes('poem') || text.includes('author')) {
      subject = 'Literature';
      topic = 'General Literature';
      difficultyLevel = 'Intermediate';
      gradeLevel = '9th-12th grade';
    }
    
    // Computer Science detection
    else if (text.includes('programming') || text.includes('code') || text.includes('algorithm') || text.includes('computer')) {
      subject = 'Computer Science';
      topic = 'Programming';
      difficultyLevel = 'Intermediate';
      gradeLevel = 'College';
    }
    
    // Generic question detection (catch-all for questions that don't fit specific categories)
    else if (text.includes('what') || text.includes('how') || text.includes('why') || text.includes('when') || text.includes('where')) {
      subject = 'General Knowledge';
      topic = 'General Inquiry';
      difficultyLevel = 'Beginner';
      gradeLevel = 'High School';
    }
    
    // Confidence calculation based on keyword matches
    const confidence = this.calculateConfidence(text, subject);
    console.log('Mock LLM confidence calculation:', { subject, topic, confidence });
    
    // Lower threshold for testing - in production this would be 0.9
    if (confidence < 0.5) {
      console.log('Mock LLM: Confidence too low, returning null');
      return null; // Not confident enough
    }
    
    const result = {
      subject,
      topic,
      difficultyLevel,
      gradeLevel,
      confidence,
    };
    
    console.log('Mock LLM analysis result:', result);
    return result;
  }
  
  // Calculate confidence based on keyword matches
  private calculateConfidence(text: string, subject: string): number {
    let matches = 0;
    const totalKeywords = 5;
    
    if (subject === 'Mathematics') {
      if (text.includes('math') || text.includes('calculate')) matches++;
      if (text.includes('+') || text.includes('-') || text.includes('*') || text.includes('/')) matches++;
      if (text.includes('equation') || text.includes('solve')) matches++;
      if (text.includes('algebra') || text.includes('geometry') || text.includes('calculus')) matches++;
      if (text.includes('number') || text.includes('digit')) matches++;
    } else if (subject === 'Physics') {
      if (text.includes('physics') || text.includes('force')) matches++;
      if (text.includes('energy') || text.includes('motion')) matches++;
      if (text.includes('velocity') || text.includes('acceleration')) matches++;
      if (text.includes('mass') || text.includes('weight')) matches++;
      if (text.includes('gravity') || text.includes('magnetic')) matches++;
    } else if (subject === 'Chemistry') {
      if (text.includes('chemistry') || text.includes('molecule')) matches++;
      if (text.includes('reaction') || text.includes('chemical')) matches++;
      if (text.includes('atom') || text.includes('element')) matches++;
      if (text.includes('acid') || text.includes('base')) matches++;
      if (text.includes('solution') || text.includes('mixture')) matches++;
    } else if (subject === 'General Knowledge') {
      // Generic questions get high confidence
      matches = 4; // High confidence for general questions
    }
    // Add more subjects as needed
    
    const confidence = Math.min(0.95, 0.6 + (matches / totalKeywords) * 0.35);
    console.log(`Confidence calculation for ${subject}: ${matches}/${totalKeywords} matches = ${confidence}`);
    return confidence;
  }

  // Generate answer for a question (mock implementation)
  async generateAnswer(questionText: string, subject: string, topic: string): Promise<{
    success: boolean;
    answer?: string;
    message: string;
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Generate mock answers based on subject and topic
      const answer = this.mockAnswerGeneration(questionText, subject, topic);
      
      if (answer) {
        return {
          success: true,
          answer,
          message: 'Answer generated successfully (mock)',
        };
      } else {
        return {
          success: false,
          message: 'Unable to generate answer for this question',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Mock LLM service error during answer generation',
      };
    }
  }

  // Mock answer generation based on subject and topic
  private mockAnswerGeneration(questionText: string, subject: string, topic: string): string | null {
    const text = questionText.toLowerCase();
    
    if (subject === 'Mathematics') {
      if (topic === 'Algebra' && text.includes('quadratic')) {
        return 'To solve quadratic equations, you can use:\n\n1) Factoring method\n2) Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a\n3) Completing the square\n\nFor your specific equation, I recommend using the quadratic formula as it works for all quadratic equations.';
      } else if (topic === 'Geometry') {
        return 'In geometry, you can solve problems using:\n\n1) Pythagorean theorem for right triangles\n2) Area and perimeter formulas\n3) Angle relationships and theorems\n4) Coordinate geometry methods';
      }
    } else if (subject === 'Physics') {
      if (topic === 'Mechanics') {
        return 'In mechanics, you can analyze:\n\n1) Forces and motion using Newton\'s laws\n2) Energy conservation (kinetic and potential)\n3) Momentum and collisions\n4) Circular motion and gravity';
      }
    } else if (subject === 'Biology') {
      if (topic === 'Cell Biology') {
        return 'Cell biology covers:\n\n1) Cell structure and organelles\n2) Cell division and reproduction\n3) Cellular processes like respiration\n4) Cell communication and signaling';
      }
    } else if (subject === 'Chemistry') {
      if (topic === 'Chemical Reactions') {
        return 'Chemical reactions involve:\n\n1) Reactants and products\n2) Balancing equations\n3) Reaction types (synthesis, decomposition, etc.)\n4) Energy changes and catalysts';
      }
    }
    
    // Generic answer for other subjects
    return 'This is a comprehensive answer based on your question. The response covers the key concepts, provides examples, and explains the reasoning step by step.';
  }

  // Check if the service is available
  isServiceAvailable(): boolean {
    return true; // Mock service is always available
  }

  // Get service status
  getServiceStatus(): {
    configured: boolean;
    apiKeyPresent: boolean;
    apiUrlPresent: boolean;
  } {
    return {
      configured: true,
      apiKeyPresent: true,
      apiUrlPresent: true,
    };
  }
}

export const mockLLMService = new MockLLMService();
