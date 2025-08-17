import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

// Make vitest globals available
(global as any).vi = vi;
(global as any).beforeEach = beforeEach;
(global as any).afterEach = afterEach;
(global as any).describe = describe;
(global as any).it = it;
(global as any).expect = expect;

// Mock environment variables for testing
process.env.VITE_GEMINI_API_KEY = 'test_api_key';
process.env.VITE_GEMINI_API_URL = 'https://test.api.url';
process.env.VITE_DATABASE_URL = 'test_database_url';
