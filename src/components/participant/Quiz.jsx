import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import QuestionView from './QuestionView';
import Leaderboard from '../leaderboard/Leaderboard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { QUIZ_STATES, MESSAGES } from '../../utils/constants';

/**
 * Main Quiz component for participants
 */
const Quiz = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  
  const {
    isConnected,
    connectionError,
    quizState,
    currentQuestion,
    timer,
    user,
    loading,
    error,
    leaveQuiz,
    getUserStats
  } = useQuiz();
  
  const [waitMessage, setWaitMessage] = useState(MESSAGES.WAITING_FOR_HOST);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(`/join`);
    }
  }, [user, navigate]);
  
  // Set appropriate waiting message based on quiz state
  useEffect(() => {
    if (quizState === QUIZ_STATES.NOT_STARTED) {
      setWaitMessage(MESSAGES.WAITING_FOR_HOST);
    } else if (quizState === QUIZ_STATES.ENDED) {
      setWaitMessage(MESSAGES.QUIZ_ENDED);
    } else if (!currentQuestion) {
      setWaitMessage(MESSAGES.WAITING_FOR_NEXT_QUESTION);
    }
  }, [quizState, currentQuestion]);
  
  // Fetch user stats when in leaderboard state
  useEffect(() => {
    if (quizState === QUIZ_STATES.LEADERBOARD && user) {
      getUserStats();
    }
  }, [quizState, user, getUserStats]);

  // Handle leaving the quiz
  const handleLeaveQuiz = async () => {
    const success = await leaveQuiz();
    if (success) {
      navigate('/');
    }
  };

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <ErrorMessage 
          message={`Connection error: ${connectionError}. Please refresh the page.`} 
        />
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  // Show loading when connecting
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Connecting to quiz...</p>
      </div>
    );
  }

  // Render the quiz based on its state
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Quiz Session: {sessionCode}
            </h1>
            {user && (
              <p className="text-sm text-gray-500">
                Joined as: {user.name}
              </p>
            )}
          </div>
          <button
            onClick={handleLeaveQuiz}
            disabled={loading}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-red-400"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Leave Quiz'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error message */}
        {error && <ErrorMessage message={error} />}
        
        {/* Quiz content based on state */}
        {quizState === QUIZ_STATES.QUESTION && currentQuestion ? (
          <QuestionView
            question={currentQuestion}
            timer={timer}
          />
        ) : quizState === QUIZ_STATES.LEADERBOARD ? (
          <Leaderboard showUserStats={true} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
            <p className="mt-6 text-lg text-gray-600">{waitMessage}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quiz;