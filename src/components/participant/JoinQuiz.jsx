import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { DEFAULT_TEXT } from '../../utils/constants';

/**
 * Component for joining a quiz as a participant
 */
const JoinQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { joinQuiz, loading, error } = useQuiz();
  
  // Parse URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const sessionCodeFromURL = queryParams.get('sessionCode');
  
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState(sessionCodeFromURL || '');
  const [formError, setFormError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!name.trim()) {
      setFormError('Please enter your name');
      return;
    }
    
    if (!sessionCode.trim()) {
      setFormError('Please enter a session code');
      return;
    }
    
    // Clear errors
    setFormError('');
    
    try {
      // Join the quiz
      const success = await joinQuiz(name, sessionCode);
      
      if (success) {
        // Navigate to the quiz page
        navigate(`/quiz/${sessionCode}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to join quiz');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {DEFAULT_TEXT.JOIN_QUIZ_TITLE}
        </h2>
        
        {/* Error message */}
        {(error || formError) && (
          <ErrorMessage message={formError || error} />
        )}
        
        {/* Join form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your name"
              required
            />
          </div>
          
          {/* Session code input - only show if not provided in URL */}
          {!sessionCodeFromURL && (
            <div>
              <label 
                htmlFor="sessionCode" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Session Code
              </label>
              <input
                id="sessionCode"
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter 6-digit code"
                required
              />
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Join Quiz'}
          </button>
        </form>
        
        {/* Back button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;