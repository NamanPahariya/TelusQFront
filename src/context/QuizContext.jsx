import { createContext, useState, useContext, useEffect } from 'react';
import { 
  CHANNELS, 
  EVENTS, 
  QUIZ_STATES, 
  STORAGE_KEYS 
} from '../utils/constants';
import { 
  getFromLocalStorage, 
  saveToLocalStorage, 
  removeFromLocalStorage,
  parseJson 
} from '../utils/helpers';
import ApiService from '../services/ApiService';
import useAbly from '../hooks/useAbly';

// Create context
const QuizContext = createContext(null);

// Hook for using the quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// Quiz provider component
export const QuizProvider = ({ children, ablyApiKey }) => {
  // Ably connection
  const { 
    isConnected, 
    connectionError, 
    subscribe, 
    publish, 
    releaseChannel 
  } = useAbly(ablyApiKey);

  // Quiz state
  const [sessionCode, setSessionCode] = useState(getFromLocalStorage(STORAGE_KEYS.SESSION_CODE) || '');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [quizState, setQuizState] = useState(QUIZ_STATES.NOT_STARTED);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  
  // User/host state
  const [user, setUser] = useState(getFromLocalStorage(STORAGE_KEYS.USER_DATA) || null);
  const [host, setHost] = useState(getFromLocalStorage(STORAGE_KEYS.HOST_DATA) || null);

  // Reset error on state changes
  useEffect(() => {
    setError(null);
  }, [sessionCode, quizState, currentQuestionIndex]);

  // Set current question when questions or index changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
    } else {
      setCurrentQuestion(null);
    }
  }, [questions, currentQuestionIndex]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (sessionCode) {
      saveToLocalStorage(STORAGE_KEYS.SESSION_CODE, sessionCode);
    } else {
      removeFromLocalStorage(STORAGE_KEYS.SESSION_CODE);
    }
  }, [sessionCode]);

  useEffect(() => {
    if (user) {
      saveToLocalStorage(STORAGE_KEYS.USER_DATA, user);
    } else {
      removeFromLocalStorage(STORAGE_KEYS.USER_DATA);
    }
  }, [user]);

  useEffect(() => {
    if (host) {
      saveToLocalStorage(STORAGE_KEYS.HOST_DATA, host);
    } else {
      removeFromLocalStorage(STORAGE_KEYS.HOST_DATA);
    }
  }, [host]);

  // Subscribe to channels when session code changes
  useEffect(() => {
    if (!isConnected || !sessionCode) return;

    // Clean up any existing subscriptions
    const cleanupFunctions = [];

    // Subscribe to users channel
    const usersChannel = CHANNELS.QUIZ_USERS(sessionCode);
    cleanupFunctions.push(
      subscribe(usersChannel, EVENTS.JOIN_QUIZ, handleUserJoin),
      subscribe(usersChannel, EVENTS.LEAVE_QUIZ, handleUserLeave)
    );

    // Subscribe to questions channel
    const questionsChannel = CHANNELS.QUIZ_QUESTIONS(sessionCode);
    cleanupFunctions.push(
      subscribe(questionsChannel, EVENTS.BROADCAST_QUESTIONS, handleQuestions),
      subscribe(questionsChannel, EVENTS.NEXT_QUESTION, handleNextQuestion)
    );

    // Subscribe to leaderboard channel
    const leaderboardChannel = CHANNELS.QUIZ_LEADERBOARD(sessionCode);
    cleanupFunctions.push(
      subscribe(leaderboardChannel, EVENTS.LEADERBOARD_UPDATE, handleLeaderboard)
    );

    // Subscribe to timer channel
    const timerChannel = CHANNELS.QUIZ_TIMER(sessionCode);
    cleanupFunctions.push(
      subscribe(timerChannel, EVENTS.ALL_EVENTS, handleTimer)
    );

    // If user is a participant, subscribe to user-specific leaderboard
    if (user && user.userId) {
      const userLeaderboardChannel = CHANNELS.QUIZ_USER_LEADERBOARD(sessionCode, user.userId);
      cleanupFunctions.push(
        subscribe(userLeaderboardChannel, EVENTS.USER_LEADERBOARD_UPDATE, handleUserStats)
      );
    }

    return () => {
      // Clean up all subscriptions
      cleanupFunctions.forEach(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  }, [isConnected, sessionCode, user, subscribe]);

  // Handle user join event
  const handleUserJoin = (message) => {
    const userData = parseJson(message.data, {});
    
    if (userData && userData.name && userData.userId) {
      setParticipants(prev => {
        const exists = prev.some(p => p.userId === userData.userId);
        if (exists) return prev;
        return [...prev, {
          name: userData.name,
          userId: userData.userId,
          sessionCode: userData.sessionCode
        }];
      });
    }
  };

  // Handle user leave event
  const handleUserLeave = (message) => {
    const userData = parseJson(message.data, {});
    
    if (userData && userData.userId) {
      setParticipants(prev => prev.filter(p => p.userId !== userData.userId));
    }
  };

  // Handle questions broadcast event
  const handleQuestions = (message) => {
    const questionsData = parseJson(message.data, []);
    
    if (Array.isArray(questionsData) && questionsData.length > 0) {
      setQuestions(questionsData);
      setCurrentQuestionIndex(0);
      setQuizState(QUIZ_STATES.QUESTION);
      // Reset answers when new questions are received
      setAnswers([]);
    }
  };

  // Handle next question event
  const handleNextQuestion = (message) => {
    const data = parseJson(message.data, {});
    
    if (data) {
      if (data.error) {
        setError(data.question?.questionText || 'Error loading next question');
        return;
      }

      if (data.question) {
        setCurrentQuestionIndex(data.currentIndex || 0);
        
        // If the question isn't already in our questions array, add it
        setQuestions(prev => {
          const exists = prev.some(q => q.id === data.question.id);
          if (exists) return prev;
          return [...prev, data.question];
        });
        
        setQuizState(QUIZ_STATES.QUESTION);
      }
    }
  };

  // Handle leaderboard update event
  const handleLeaderboard = (message) => {
    const leaderboardData = parseJson(message.data, []);
    
    if (Array.isArray(leaderboardData)) {
      setLeaderboard(leaderboardData);
      
      // If we're in question state and this is the final question, switch to leaderboard
      if (quizState === QUIZ_STATES.QUESTION && 
          currentQuestionIndex >= questions.length - 1) {
        setQuizState(QUIZ_STATES.LEADERBOARD);
      }
    }
  };

  // Handle user stats update event
  const handleUserStats = (message) => {
    const statsData = parseJson(message.data, null);
    
    if (statsData && statsData.userId) {
      setUserStats(statsData);
    }
  };

  // Handle timer events
  const handleTimer = (message) => {
    const timerData = parseJson(message.data, {});
    
    if (timerData) {
      if (message.name === 'timerUpdate') {
        setTimer({
          remainingTime: timerData.remainingTime,
          questionIndex: timerData.questionIndex,
          sessionCode: timerData.sessionCode
        });
      } else if (message.name === 'timeUp') {
        setTimer({
          remainingTime: 0,
          questionIndex: timerData.questionIndex,
          sessionCode: timerData.sessionCode,
          isComplete: true
        });
        
        // Auto-submit any pending answers when time is up
        submitPendingAnswers();
      }
    }
  };

  // Host actions
  const startQuiz = async (hostData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newHost = {
        name: hostData.name || 'Anonymous Host',
        id: hostData.id || `host-${Date.now()}`,
        email: hostData.email || '',
        quizId: '',
        profilePictureUrl: hostData.profilePictureUrl || ''
      };
      
      const sessionCode = await ApiService.startQuiz(newHost);
      
      setSessionCode(sessionCode);
      setHost(newHost);
      setQuizState(QUIZ_STATES.NOT_STARTED);
      
      return sessionCode;
    } catch (err) {
      setError(err.message || 'Failed to start quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (questionsData) => {
    if (!sessionCode) {
      setError('No active session. Please start a quiz first.');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Make sure all questions have the session code
      const questions = questionsData.map(q => ({
        ...q,
        sessionCode
      }));
      
      await ApiService.createQuiz(questions);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const broadcastQuestions = async () => {
    if (!sessionCode) {
      setError('No active session');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const questionsData = await ApiService.broadcastQuestions(sessionCode);
      setQuestions(questionsData);
      setCurrentQuestionIndex(0);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to broadcast questions');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const goToNextQuestion = async () => {
    if (!sessionCode) {
      setError('No active session');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const nextIndex = currentQuestionIndex + 1;
      
      const response = await ApiService.nextQuestion(sessionCode, nextIndex);
      
      if (response.error) {
        // If we reached the end, show the leaderboard
        if (nextIndex >= questions.length) {
          setQuizState(QUIZ_STATES.LEADERBOARD);
          await getLeaderboard();
        } else {
          setError('Error loading next question');
        }
        return false;
      }
      
      setCurrentQuestionIndex(nextIndex);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to advance to next question');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = async () => {
    if (!sessionCode) {
      setError('No active session');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const leaderboardData = await ApiService.getLeaderboard(sessionCode);
      setLeaderboard(leaderboardData);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to get leaderboard');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Participant actions
  const joinQuiz = async (name, code) => {
    if (!code) {
      setError('Session code is required');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First validate the session code
      await ApiService.validateSessionCode(code, name);
      
      // Then join the quiz
      const joinResponse = await ApiService.joinQuiz(name, code);
      
      setSessionCode(code);
      setUser({
        name,
        userId: joinResponse.userId,
        sessionCode: code,
        joinedAt: new Date()
      });
      
      setQuizState(QUIZ_STATES.NOT_STARTED);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to join quiz');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const leaveQuiz = async () => {
    if (!sessionCode || !user) {
      setError('Not currently in a quiz');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await ApiService.leaveQuiz(user.name, sessionCode, user.userId);
      
      // Clean up local state
      setSessionCode('');
      setUser(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setCurrentQuestion(null);
      setQuizState(QUIZ_STATES.NOT_STARTED);
      setAnswers([]);
      setTimer(null);
      setLeaderboard([]);
      setUserStats(null);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to leave quiz');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId, selectedOption) => {
    if (!sessionCode || !user || !questionId) {
      setError('Missing required information for answer submission');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Find the current question
      const question = questions.find(q => q.id === questionId);
      if (!question) {
        setError('Question not found');
        return false;
      }
      
      // Check if this answer is correct
      const isCorrect = selectedOption === question.correctAnswer;
      
      // Create the answer object
      const answerObj = {
        userId: user.userId,
        sessionCode,
        name: user.name,
        question: { id: questionId },
        SelectedOption: selectedOption,
        isCorrect
      };
      
      // Store the answer locally
      setAnswers(prev => [...prev, answerObj]);
      
      // Submit the answer immediately
      await ApiService.saveAnswers([answerObj]);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Submit any answers that haven't been sent to the server
  const submitPendingAnswers = async () => {
    if (answers.length === 0) return;
    
    try {
      await ApiService.saveAnswers(answers);
      // Clear answers after successful submission
      setAnswers([]);
    } catch (err) {
      console.error('Error submitting pending answers:', err);
    }
  };

  const getUserStats = async () => {
    if (!sessionCode || !user) {
      setError('Not currently in a quiz');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const stats = await ApiService.getUserLeaderboard(
        sessionCode,
        user.name,
        user.userId
      );
      
      setUserStats(stats);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to get user stats');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset the quiz
  const resetQuiz = () => {
    setSessionCode('');
    setUser(null);
    setHost(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(null);
    setQuizState(QUIZ_STATES.NOT_STARTED);
    setAnswers([]);
    setTimer(null);
    setParticipants([]);
    setLeaderboard([]);
    setUserStats(null);
    setError(null);
  };
  
  // Context value
  const value = {
    // State
    isConnected,
    connectionError,
    sessionCode,
    questions,
    currentQuestionIndex,
    currentQuestion,
    quizState,
    loading,
    error,
    timer,
    participants,
    leaderboard,
    userStats,
    user,
    host,
    
    // Host actions
    startQuiz,
    createQuiz,
    broadcastQuestions,
    goToNextQuestion,
    getLeaderboard,
    
    // Participant actions
    joinQuiz,
    leaveQuiz,
    submitAnswer,
    getUserStats,
    
    // Common actions
    resetQuiz
  };
  
  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};