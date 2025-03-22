import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Host dashboard for starting a new quiz or joining an existing one
 */
const QuizDashboard = () => {
  const navigate = useNavigate();
  const { loading, error, startQuiz } = useQuiz();
  
  const [hostName, setHostName] = useState('');
  const [formError, setFormError] = useState('');

  // Handle starting a new quiz
  const handleStartQuiz = async (e) => {
    e.preventDefault();
    
    if (!hostName.trim()) {
      setFormError('Please enter your name');
      return;
    }
    
    // Clear errors
    setFormError('');
    
    try {
      // Start the quiz
      const sessionCode = await startQuiz({
        name: hostName,
        id: `host-${Date.now()}`
      });
      
      // Navigate to quiz creation
      navigate('/host/create');
    } catch (err) {
      setFormError(err.message || 'Failed to start quiz');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Host a Quiz
        </h2>
        
        {/* Error message */}
        {(error || formError) && (
          <ErrorMessage message={formError || error} />
        )}
        
        {/* Host form */}
        <form onSubmit={handleStartQuiz} className="space-y-4">
          <div>
            <label 
              htmlFor="hostName" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create New Quiz'}
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

export default QuizDashboard;