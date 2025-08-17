import type { User } from '../types';

const USER_STORAGE_KEY = 'user';

/**
 * Save user to localStorage
 */
export const saveUserToStorage = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
    // In production, you might want to show a user-friendly error message
  }
};

/**
 * Get user from localStorage
 */
export const getUserFromStorage = (): User | null => {
  try {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
};

/**
 * Clear user from localStorage
 */
export const clearUserFromStorage = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
};

/**
 * Check if user is authenticated (has valid data in localStorage)
 */
export const isUserAuthenticated = (): boolean => {
  const user = getUserFromStorage();
  return user !== null && 
         typeof user === 'object' && 
         'id' in user && 
         'fullName' in user && 
         'mobileNumber' in user;
};
