import { useQuiz } from '../../context/QuizContext';
import UserStats from './UserStats';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Component for displaying the quiz leaderboard
 */
const Leaderboard = ({ showUserStats = false }) => {
  const { leaderboard, loading, userStats } = useQuiz();

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Leaderboard</h2>
      
      {/* User's personal stats */}
      {showUserStats && userStats && (
        <UserStats stats={userStats} />
      )}
      
      {/* Leaderboard table */}
      {loading ? (
        <div className="flex flex-col items-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No results to display yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry, index) => {
                // Extract name from composite key if needed (e.g., "userId:name")
                const displayName = entry.name.includes(':') 
                  ? entry.name.split(':')[1] 
                  : entry.name;
                
                // Determine if this is the user's row
                const isCurrentUser = userStats && 
                  (entry.name === `${userStats.userId}:${userStats.name}` || 
                   displayName === userStats.name);
                
                return (
                  <tr 
                    key={index}
                    className={isCurrentUser ? 'bg-indigo-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.rank || index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {displayName}
                      {isCurrentUser && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                      {typeof entry.score === 'number' ? entry.score.toFixed(1) : entry.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;