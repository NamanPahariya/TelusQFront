import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import QuestionCreator from './QuestionCreator';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { DEFAULT_TEXT, DEFAULT_QUIZ_TIME_LIMIT, MAX_QUESTIONS_PER_QUIZ } from '../../utils/constants';

/**
 * Component for creating a new quiz by the host
 */
const CreateQuiz = () => {
  const navigate = useNavigate();
  const { startQuiz, createQuiz, loading, error, sessionCode, host } = useQuiz();
  
  const [hostName, setHostName] = useState(host?.name || '');
  const [hostEmail, setHostEmail] = useState(host?.email || '');
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      questionText: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '',
      timeLimit: DEFAULT_QUIZ_TIME_LIMIT,
      Title: '',
    }
  ]);
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState('');

  // Handle host information submission
  const handleHostSubmit = async (e) => {
    e.preventDefault();
    
    if (!hostName.trim()) {
      setFormError('Host name is required');
      return;
    }
    
    // Clear errors
    setFormError('');
    
    try {
      // Start the quiz
      const newSessionCode = await startQuiz({
        name: hostName,
        email: hostEmail,
        id: `host-${Date.now()}`,
      });
      
      // Move to the next step
      setStep(2);
    } catch (err) {
      setFormError(err.message || 'Failed to start quiz');
    }
  };

  // Handle adding a new question
  const handleAddQuestion = () => {
    if (questions.length >= MAX_QUESTIONS_PER_QUIZ) {
      setFormError(`You can add a maximum of ${MAX_QUESTIONS_PER_QUIZ} questions`);
      return;
    }
    
    setQuestions(prevQuestions => [
      ...prevQuestions, 
      {
        id: Date.now(),
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '',
        timeLimit: DEFAULT_QUIZ_TIME_LIMIT,
        Title: quizTitle,
      }
    ]);
  };

  // Handle removing a question
  const handleRemoveQuestion = (id) => {
    if (questions.length <= 1) {
      setFormError('You need at least one question');
      return;
    }
    
    setQuestions(prevQuestions => 
      prevQuestions.filter(question => question.id !== id)
    );
  };

  // Handle updating a question
  const handleQuestionChange = (id, updatedQuestion) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(question => 
        question.id === id ? { ...updatedQuestion, id } : question
      )
    );
  };

  // Handle quiz creation submission
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    // Validate quiz
    const invalidQuestions = questions.filter(q => 
      !q.questionText.trim() || 
      !q.option1.trim() || 
      !q.option2.trim() || 
      !q.correctAnswer
    );
    
    if (invalidQuestions.length > 0) {
      setFormError(`Please complete all required fields for ${invalidQuestions.length} question(s)`);
      return;
    }
    
    // Clear errors
    setFormError('');
    
    try {
      // Add quiz title to all questions
      const questionsWithTitle = questions.map(q => ({
        ...q,
        Title: quizTitle || 'Unnamed Quiz',
      }));
      
      // Create the quiz
      const success = await createQuiz(questionsWithTitle);
      
      if (success) {
        // Navigate to quiz management
        navigate(`/host/manage/${sessionCode}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          {DEFAULT_TEXT.CREATE_QUIZ_TITLE}
        </h1>
        
        {/* Error message */}
        {(error || formError) && (
          <ErrorMessage message={formError || error} />
        )}
        
        {/* Step 1: Host Information */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Host Information</h2>
            <form onSubmit={handleHostSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="hostName" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name*
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
              
              <div>
                <label 
                  htmlFor="hostEmail" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email (optional)
                </label>
                <input
                  id="hostEmail"
                  type="email"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Step 2: Create Quiz */}
        {step === 2 && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quiz Details</h2>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  Session Code: {sessionCode}
                </span>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="quizTitle" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quiz Title
                </label>
                <input
                  id="quizTitle"
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 border text-black bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter quiz title"
                />
              </div>
            </div>
            
            {/* Questions */}
            <div className="space-y-6 mb-8">
              {questions.map((question, index) => (
                <QuestionCreator
                  key={question.id}
                  question={question}
                  index={index}
                  onChange={(updatedQuestion) => handleQuestionChange(question.id, updatedQuestion)}
                  onRemove={() => handleRemoveQuestion(question.id)}
                  canRemove={questions.length > 1}
                />
              ))}
            </div>
            
            {/* Add Question Button */}
            <div className="flex justify-center mb-8">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Question
              </button>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCreateQuiz}
                disabled={loading}
                className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create Quiz'}
              </button>
            </div>
          </div>
        )}
        
        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => step === 1 ? navigate('/') : setStep(1)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← {step === 1 ? 'Back to Home' : 'Back to Host Information'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;