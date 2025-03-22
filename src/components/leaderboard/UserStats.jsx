/**
 * Component for displaying a user's statistics in the quiz
 */
const UserStats = ({ stats }) => {
    if (!stats) return null;
  
    return (
      <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
        <h3 className="text-lg font-medium text-indigo-800 mb-2">Your Results</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded p-3 shadow-sm">
            <div className="text-xs text-gray-500 uppercase">Rank</div>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.rank || 'N/A'}
              {stats.totalParticipants && (
                <span className="text-sm text-gray-600 font-normal ml-1">
                  of {stats.totalParticipants}
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded p-3 shadow-sm">
            <div className="text-xs text-gray-500 uppercase">Score</div>
            <div className="text-2xl font-bold text-indigo-600">
              {typeof stats.score === 'number' ? stats.score.toFixed(1) : stats.score || 0}
            </div>
          </div>
          
          <div className="bg-white rounded p-3 shadow-sm">
            <div className="text-xs text-gray-500 uppercase">Percentile</div>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.totalParticipants && stats.rank 
                ? Math.round(((stats.totalParticipants - stats.rank) / stats.totalParticipants) * 100)
                : 'N/A'
              }
              {stats.totalParticipants && stats.rank && (
                <span className="text-sm text-gray-600 font-normal ml-1">%</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default UserStats;