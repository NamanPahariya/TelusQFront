import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import Leaderboard from '../leaderboard/Leaderboard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { QUIZ_STATES } from '../../utils/constants';
import { formatTime } from '../../utils/helpers';

import { QRCodeSVG } from 'qrcode.react'

/**
 * Component for quiz management by the host
 */
const ManageQuiz = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  
  const {
    isConnected,
    connectionError,
    quizState,
    questions,
    currentQuestionIndex,
    currentQuestion,
    timer,
    host,
    participants,
    loading,
    error,
    broadcastQuestions,
    goToNextQuestion,
    getLeaderboard,
    resetQuiz
  } = useQuiz();
  
  const [copied, setCopied] = useState(false);
  
  // Redirect if not logged in as host
  useEffect(() => {
    if (!host) {
      navigate('/host');
    }
  }, [host, navigate]);
  
  // Copy session code to clipboard
  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        console.error('Failed to copy session code');
      }
    );
  };
  
  // Start the quiz
  const handleStartQuiz = async () => {
    await broadcastQuestions();
  };
  
  // Go to the next question
  const handleNextQuestion = async () => {
    await goToNextQuestion();
  };
  
  // Show the leaderboard
  const handleShowLeaderboard = async () => {
    await getLeaderboard();
  };
  
  // End the quiz and return to home
  const handleEndQuiz = () => {
    resetQuiz();
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Manage Quiz
            </h1>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 mr-2">Session Code:</span>
              <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{sessionCode}</span>
              <button
                onClick={copySessionCode}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
                title="Copy to clipboard"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              {copied && (
                <span className="ml-2 text-xs text-green-600">Copied!</span>
              )}
            </div>
            
            {/* QR Code for easy joining */}
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Scan to join:</p>
              <QRCodeSVG
                value={`https://telusq-front.vercel.app/join?sessionCode=${sessionCode}`} 
                size={120}
                level="H"
                includeMargin={true}
                className="border border-gray-200 rounded"
              />
            </div>
          </div>
          <button
            onClick={handleEndQuiz}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            End Quiz
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error message */}
        {error && <ErrorMessage message={error} />}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quiz controls */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Quiz Controls</h2>
              
              <div className="space-y-4">
                {quizState === QUIZ_STATES.NOT_STARTED ? (
                  <button
                    onClick={handleStartQuiz}
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Start Quiz'}
                  </button>
                ) : (
                  <>
                    {quizState === QUIZ_STATES.QUESTION && (
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Current Question: {currentQuestionIndex + 1} of {questions.length}
                          </span>
                          {timer && (
                            <span className={`font-bold ${timer.remainingTime < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                              Time Left: {formatTime(timer.remainingTime)}
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                          <p className="font-medium">{currentQuestion?.questionText}</p>
                        </div>
                        
                        <button
                          onClick={handleNextQuestion}
                          disabled={loading || currentQuestionIndex >= questions.length - 1}
                          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                          {loading ? <LoadingSpinner size="sm" /> : (
                            currentQuestionIndex >= questions.length - 1 
                              ? 'No More Questions' 
                              : 'Next Question'
                          )}
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={handleShowLeaderboard}
                      disabled={loading}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Show Leaderboard'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Question List */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Questions</h2>
              
              {questions.length === 0 ? (
                <p className="text-gray-500">No questions available.</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div 
                      key={question.id} 
                      className={`p-3 rounded-md ${
                        index === currentQuestionIndex && quizState === QUIZ_STATES.QUESTION
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Q{index + 1}:</span>
                        <span className="text-xs text-gray-500">{question.timeLimit}s</span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2">{question.questionText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Participants */}
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">
                Participants ({participants.length})
              </h2>
              
              {participants.length === 0 ? (
                <p className="text-gray-500">No participants yet.</p>
              ) : (
                <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                  {participants.map((participant, index) => (
                    <li key={participant.userId} className="py-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-800 font-medium text-sm">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {participant.name}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {quizState === QUIZ_STATES.LEADERBOARD && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Leaderboard</h2>
                <Leaderboard />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ManageQuiz;