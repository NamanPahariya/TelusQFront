import { useNavigate } from 'react-router-dom';
import { DEFAULT_TEXT } from '../utils/constants';

/**
 * Home page component
 */
const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {DEFAULT_TEXT.WELCOME_TITLE}
        </h1>
        <p className="text-xl text-gray-600">
          {DEFAULT_TEXT.WELCOME_SUBTITLE}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-xs">
          <div className="bg-indigo-100 rounded-full p-4 mb-6 inline-block">
            <svg className="h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {DEFAULT_TEXT.HOST_CTA}
          </h2>
          <p className="text-gray-600 mb-6">
            Create and manage interactive quizzes. Monitor participant progress and view results in real-time.
          </p>
          <button
            onClick={() => navigate('/host')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Get Started
          </button>
        </div>
        
        {/* <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-xs">
          <div className="bg-green-100 rounded-full p-4 mb-6 inline-block">
            <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {DEFAULT_TEXT.JOIN_CTA}
          </h2>
          <p className="text-gray-600 mb-6">
            Join a quiz using a session code. Answer questions, compete with others, and see how you rank.
          </p>
          <button
            onClick={() => navigate('/join')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Join Now
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Home;