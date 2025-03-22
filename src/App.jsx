import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { ROUTES, ABLY_API_KEY } from './utils/constants';

// Common components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Host components
import QuizDashboard from './components/host/QuizDashboard';
import CreateQuiz from './components/host/CreateQuiz';
import ManageQuiz from './components/host/ManageQuiz';

// Participant components
import JoinQuiz from './components/participant/JoinQuiz';
import Quiz from './components/participant/Quiz';

// Home page
import Home from './components/Home';

/**
 * Main application component
 */
function App() {
  return (
    <QuizProvider ablyApiKey={ABLY_API_KEY}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Header />
          <div className="flex-grow">
            <Routes>
              {/* Home route */}
              <Route path={ROUTES.HOME} element={<Home />} />
              
              {/* Host routes */}
              <Route path={ROUTES.HOST_DASHBOARD} element={<QuizDashboard />} />
              <Route path={ROUTES.CREATE_QUIZ} element={<CreateQuiz />} />
              <Route path={ROUTES.MANAGE_QUIZ} element={<ManageQuiz />} />
              
              {/* Participant routes */}
              <Route path={ROUTES.JOIN_QUIZ} element={<JoinQuiz />} />
              <Route path={ROUTES.QUIZ} element={<Quiz />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </QuizProvider>
  );
}

export default App;