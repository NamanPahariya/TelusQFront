import { Link } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';

/**
 * Application header component
 */
const Header = () => {
  const { user, host, leaveQuiz, resetQuiz } = useQuiz();
  
  // Handle logout for both participants and hosts
  const handleLogout = async () => {
    if (user) {
      await leaveQuiz();
    } else {
      resetQuiz();
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold text-indigo-600">TelusQ</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          {(user || host) && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {user ? `Joined as: ${user.name}` : `Host: ${host.name}`}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;