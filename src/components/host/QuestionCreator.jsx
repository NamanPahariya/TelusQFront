import { useState, useEffect } from 'react';
import { DEFAULT_QUIZ_TIME_LIMIT } from '../../utils/constants';

/**
 * Component for creating/editing a quiz question
 */
const QuestionCreator = ({ 
  question, 
  index, 
  onChange, 
  onRemove, 
  canRemove = true 
}) => {
  const [localQuestion, setLocalQuestion] = useState(question);
  
  // Update local state when question prop changes
  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const updatedQuestion = {
      ...localQuestion,
      [name]: value
    };
    
    setLocalQuestion(updatedQuestion);
    onChange(updatedQuestion);
  };
  
  // Handle correct answer selection
  const handleCorrectAnswerChange = (option) => {
    const updatedQuestion = {
      ...localQuestion,
      correctAnswer: option
    };
    
    setLocalQuestion(updatedQuestion);
    onChange(updatedQuestion);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">Question {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
            aria-label="Remove question"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Question Text */}
      <div className="mb-4">
        <label 
          htmlFor={`questionText-${index}`} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Question Text*
        </label>
        <textarea
          id={`questionText-${index}`}
          name="questionText"
          value={localQuestion.questionText}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter the question"
          required
        />
      </div>
      
      {/* Options */}
      <div className="space-y-3 mb-4">
        {[1, 2, 3, 4].map((optionNum) => {
          const optionKey = `option${optionNum}`;
          const isRequired = optionNum <= 2; // First two options are required
          
          return (
            <div key={optionKey} className="flex items-start">
              <div className="mr-3 mt-2">
                <input
                  type="radio"
                  id={`correctAnswer-${index}-${optionKey}`}
                  name={`correctAnswer-${index}`}
                  checked={localQuestion.correctAnswer === optionKey}
                  onChange={() => handleCorrectAnswerChange(optionKey)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
              </div>
              <div className="flex-grow">
                <label 
                  htmlFor={`${optionKey}-${index}`} 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Option {optionNum}{isRequired ? '*' : ''}
                </label>
                <input
                  id={`${optionKey}-${index}`}
                  name={optionKey}
                  value={localQuestion[optionKey]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Enter option ${optionNum}`}
                  required={isRequired}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Time Limit */}
      <div className="mb-4">
        <label 
          htmlFor={`timeLimit-${index}`} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Time Limit (seconds)
        </label>
        <input
          id={`timeLimit-${index}`}
          name="timeLimit"
          type="number"
          value={localQuestion.timeLimit}
          onChange={handleChange}
          min="5"
          max="300"
          className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Time limit in seconds"
        />
      </div>
      
      {/* Validation messages */}
      {!localQuestion.correctAnswer && (
        <p className="text-yellow-600 text-sm mt-2">
          Please select a correct answer by clicking the radio button next to an option.
        </p>
      )}
    </div>
  );
};

export default QuestionCreator;