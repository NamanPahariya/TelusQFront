import { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { formatTime } from '../../utils/helpers';
import { MESSAGES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Component for displaying a quiz question to participants
 */
const QuestionView = ({ question, timer }) => {
  const { submitAnswer, loading } = useQuiz();
  
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(timer?.remainingTime || null);
  const [timeUp, setTimeUp] = useState(false);
  
  // Reset state when question changes
  useEffect(() => {
    if (question) {
      setSelectedOption('');
      setIsSubmitted(false);
      setFeedback('');
      setTimeUp(false);
    }
  }, [question]);
  
  // Update time left when timer changes
  useEffect(() => {
    if (timer) {
      setTimeLeft(timer.remainingTime);
      if (timer.isComplete) {
        setTimeUp(true);
        if (!isSubmitted) {
          setFeedback(MESSAGES.TIME_UP);
        }
      }
    }
  }, [timer, isSubmitted]);
  
  // Auto-submit when time is up
  useEffect(() => {
    if (timeUp && !isSubmitted && selectedOption) {
      handleSubmit();
    }
  }, [timeUp, isSubmitted, selectedOption]);

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (isSubmitted || timeUp) return;
    setSelectedOption(option);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!question || !selectedOption || isSubmitted) return;
    
    try {
      const success = await submitAnswer(question.id, selectedOption);
      
      if (success) {
        setIsSubmitted(true);
        
        // Set appropriate feedback
        const isCorrect = selectedOption === question.correctAnswer;
        setFeedback(
          isCorrect
            ? MESSAGES.QUESTION_CORRECT
            : MESSAGES.QUESTION_INCORRECT
        );
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  // If no question is provided
  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading question...</p>
      </div>
    );
  }

  // Extract options from the question
  const options = [
    { value: question.option1, key: 'option1' },
    { value: question.option2, key: 'option2' },
    { value: question.option3, key: 'option3' },
    { value: question.option4, key: 'option4' },
  ].filter(option => option.value); // Filter out empty options

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      {/* Timer */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">
          Time Limit: {question.timeLimit} seconds
        </span>
        <span className={`font-bold text-lg ${timeLeft && timeLeft < 10 ? 'text-red-600' : 'text-blue-600'}`}>
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </span>
      </div>
      
      {/* Question text */}
      <h2 className="text-xl font-semibold mb-6">{question.questionText}</h2>
      
      {/* Options */}
      <div className="space-y-3 mb-8">
        {options.map((option, index) => (
          <button
            key={option.key}
            onClick={() => handleOptionSelect(option.key)}
            disabled={isSubmitted || timeUp}
            className={`w-full p-4 text-left rounded-md transition-colors ${
              selectedOption === option.key
                ? 'bg-indigo-100 border-2 border-indigo-500'
                : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
            } ${
              isSubmitted && option.key === question.correctAnswer
                ? 'bg-green-100 border-2 border-green-500'
                : isSubmitted && option.key === selectedOption && option.key !== question.correctAnswer
                ? 'bg-red-100 border-2 border-red-500'
                : ''
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
            {option.value}
          </button>
        ))}
      </div>
      
      {/* Submit button */}
      {!isSubmitted && !timeUp && (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption || loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Submit Answer'}
        </button>
      )}
      
      {/* Feedback after submission */}
      {(isSubmitted || timeUp) && feedback && (
        <div className={`p-4 rounded-md ${
          feedback === MESSAGES.QUESTION_CORRECT
            ? 'bg-green-100 text-green-800'
            : feedback === MESSAGES.TIME_UP
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          <p className="font-medium">{feedback}</p>
          {isSubmitted && selectedOption !== question.correctAnswer && (
            <p className="mt-2">
              The correct answer was: {
                options.find(opt => opt.key === question.correctAnswer)?.value || question.correctAnswer
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionView;