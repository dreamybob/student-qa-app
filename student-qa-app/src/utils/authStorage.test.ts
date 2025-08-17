import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveUserToStorage, getUserFromStorage, clearUserFromStorage, isUserAuthenticated } from './authStorage';
import type { User } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockUser: User = {
  id: 'user_123',
  fullName: 'John Doe',
  mobileNumber: '9876543210',
  createdAt: new Date('2024-01-15T10:30:00'),
};

describe('authStorage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveUserToStorage', () => {
    it('saves user to localStorage', () => {
      saveUserToStorage(mockUser);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser)
      );
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw error
      expect(() => saveUserToStorage(mockUser)).not.toThrow();
    });
  });

  describe('getUserFromStorage', () => {
    it('retrieves user from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const result = getUserFromStorage();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
      // The Date gets serialized to string in localStorage, so we need to compare accordingly
      expect(result).toMatchObject({
        id: mockUser.id,
        fullName: mockUser.fullName,
        mobileNumber: mockUser.mobileNumber,
      });
      expect(result?.createdAt).toBe(mockUser.createdAt.toISOString());
    });

    it('returns null when no user in storage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getUserFromStorage();
      
      expect(result).toBeNull();
    });

    it('returns null when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue('');
      
      const result = getUserFromStorage();
      
      expect(result).toBeNull();
    });

    it('handles invalid JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = getUserFromStorage();
      
      expect(result).toBeNull();
    });
  });

  describe('clearUserFromStorage', () => {
    it('removes user from localStorage', () => {
      clearUserFromStorage();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw error
      expect(() => clearUserFromStorage()).not.toThrow();
    });
  });

  describe('isUserAuthenticated', () => {
    it('returns true for valid user', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const result = isUserAuthenticated();
      
      expect(result).toBe(true);
    });

    it('returns false for invalid user', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ invalid: 'user' }));
      
      const result = isUserAuthenticated();
      
      expect(result).toBe(false);
    });

    it('returns false for null user', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = isUserAuthenticated();
      
      expect(result).toBe(false);
    });
  });
});
