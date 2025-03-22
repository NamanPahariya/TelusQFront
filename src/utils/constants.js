/**
 * Application constants
 */

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY;

// Channel name constants - matching backend naming conventions
export const CHANNELS = {
  QUIZ_SESSION: 'quiz:session',
  QUIZ_USERS: (sessionCode) => `quiz:users:${sessionCode}`,
  QUIZ_QUESTIONS: (sessionCode) => `quiz:questions:${sessionCode}`,
  QUIZ_LEADERBOARD: (sessionCode) => `quiz:leaderboard:${sessionCode}`,
  QUIZ_USER_LEADERBOARD: (sessionCode, userId) => `quiz:leaderboard:${sessionCode}:${userId}`,
  QUIZ_TIMER: (sessionCode) => `quiz:${sessionCode}:timer`
};

// Events to subscribe to - matching backend events
export const EVENTS = {
  START_QUIZ: 'startQuiz',
  JOIN_QUIZ: 'joinQuiz',
  LEAVE_QUIZ: 'leaveQuiz',
  BROADCAST_QUESTIONS: 'broadcastQuestions',
  NEXT_QUESTION: 'nextQuestion',
  LEADERBOARD_UPDATE: 'leaderboardUpdate',
  USER_LEADERBOARD_UPDATE: 'userLeaderboardUpdate',
  TIMER_UPDATE: 'timerUpdate',
  TIME_UP: 'timeUp',
  ALL_EVENTS: '*'
};

// Quiz states - matching backend states
export const QUIZ_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  QUESTION: 'QUESTION',
  ENDED: 'ENDED',
  LEADERBOARD: 'LEADERBOARD'
};

// Common application constants
export const DEFAULT_QUIZ_TIME_LIMIT = 30; // seconds
export const MAX_OPTIONS_PER_QUESTION = 4;
export const MAX_QUESTIONS_PER_QUIZ = 20;

// Storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'telusq_user_data',
  HOST_DATA: 'telusq_host_data',
  SESSION_CODE: 'telusq_session_code'
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  HOST_DASHBOARD: '/host',
  CREATE_QUIZ: '/host/create',
  MANAGE_QUIZ: '/host/manage/:sessionCode',
  JOIN_QUIZ: '/join',
  QUIZ: '/quiz/:sessionCode',
  RESULTS: '/results/:sessionCode'
};

// Quiz feedback/prompt messaging
export const MESSAGES = {
  QUESTION_CORRECT: 'Correct! Well done!',
  QUESTION_INCORRECT: 'Sorry, that\'s not right.',
  TIME_UP: 'Time\'s up!',
  WAITING_FOR_HOST: 'Waiting for the host to start the quiz...',
  WAITING_FOR_NEXT_QUESTION: 'Get ready for the next question...',
  QUIZ_ENDED: 'The quiz has ended. Check out the leaderboard!',
};

// Default text
export const DEFAULT_TEXT = {
  WELCOME_TITLE: 'Welcome to TelusQ',
  WELCOME_SUBTITLE: 'A real-time interactive quiz platform',
  HOST_CTA: 'Host a Quiz',
  // JOIN_CTA: 'Join a Quiz',
  CREATE_QUIZ_TITLE: 'Create Your Quiz',
  JOIN_QUIZ_TITLE: 'Join a Quiz',
  NO_QUIZ_FOUND: 'Quiz not found or has ended.',
};