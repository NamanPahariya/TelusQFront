/**
 * Utility helper functions
 */

import { STORAGE_KEYS } from './constants';

/**
 * Format time in seconds to MM:SS display
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (timeInSeconds) => {
  if (timeInSeconds === undefined || timeInSeconds === null) return '00:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Safely store data in localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error.message}`);
  }
};

/**
 * Safely retrieve data from localStorage
 * @param {string} key - Storage key
 * @returns {*} - Retrieved data or null
 */
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting from localStorage: ${error.message}`);
    return null;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error.message}`);
  }
};

/**
 * Check if the user is logged in as a host
 * @returns {boolean} - Whether the user is a host
 */
export const isHost = () => {
  return !!getFromLocalStorage(STORAGE_KEYS.HOST_DATA);
};

/**
 * Check if the user is logged in as a participant
 * @returns {boolean} - Whether the user is a participant
 */
export const isParticipant = () => {
  return !!getFromLocalStorage(STORAGE_KEYS.USER_DATA);
};

/**
 * Get session code from localStorage
 * @returns {string|null} - Session code or null
 */
export const getSessionCode = () => {
  return getFromLocalStorage(STORAGE_KEYS.SESSION_CODE);
};

/**
 * Calculate time elapsed between two timestamps
 * @param {Date} startTime - Start timestamp
 * @param {Date} endTime - End timestamp
 * @returns {number} - Elapsed time in seconds
 */
export const calculateElapsedTime = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  // Convert to Date objects if they're strings
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);
  
  return (end.getTime() - start.getTime()) / 1000;
};

/**
 * Create a unique ID
 * @returns {string} - Unique ID
 */
export const createUniqueId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed JSON or default value
 */
export const parseJson = (jsonString, defaultValue = null) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error(`Error parsing JSON: ${error.message}`);
    return defaultValue;
  }
};

/**
 * Shuffle an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};