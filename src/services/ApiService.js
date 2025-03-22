/**
 * Service for API calls to the backend
 */
class ApiService {
    constructor(baseUrl = 'https://meter-jar-bras-stat.trycloudflare.com') {
      this.baseUrl = baseUrl;
      this.apiPath = '/api/quiz';
    }
  
    /**
     * Set the base URL for the API
     * @param {string} url - The base URL
     */
    setBaseUrl(url) {
      this.baseUrl = url;
    }
  
    /**
     * Create headers for API requests
     * @param {boolean} includeJson - Whether to include Content-Type: application/json
     * @returns {Headers} - Headers object
     */
    createHeaders(includeJson = true) {
      const headers = new Headers();
      if (includeJson) {
        headers.append('Content-Type', 'application/json');
      }
      return headers;
    }
  
    /**
     * Make a fetch request with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - Response promise
     */
    async fetchWithErrorHandling(endpoint, options) {
      try {
        const url = `${this.baseUrl}${this.apiPath}${endpoint}`;
        console.log(`Making request to: ${url}`);
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }
        
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    }
  
    // Quiz Host APIs
  
    /**
     * Start a new quiz
     * @param {Object} host - Host information
     * @returns {Promise<string>} - Session code
     */
    async startQuiz(host) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(host)
      };
      
      return this.fetchWithErrorHandling('/startQuiz', options);
    }
  
    /**
     * Create a quiz with questions
     * @param {Array} questions - Array of question objects
     * @returns {Promise<Object>} - Response
     */
    async createQuiz(questions) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(questions)
      };
      
      return this.fetchWithErrorHandling('/create', options);
    }
  
    /**
     * Broadcast questions for a session
     * @param {string} sessionCode - Quiz session code
     * @returns {Promise<Array>} - List of questions
     */
    async broadcastQuestions(sessionCode) {
      const options = {
        method: 'POST',
        headers: this.createHeaders()
      };
      
      return this.fetchWithErrorHandling(`/broadcastQuestions/${sessionCode}`, options);
    }
  
    /**
     * Get the next question for a session
     * @param {string} sessionCode - Quiz session code
     * @param {number} index - Current question index
     * @returns {Promise<Object>} - Next question
     */
    async nextQuestion(sessionCode, index) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({ index })
      };
      
      return this.fetchWithErrorHandling(`/nextQuestion/${sessionCode}`, options);
    }
  
    /**
     * Get the leaderboard for a session
     * @param {string} sessionCode - Quiz session code
     * @returns {Promise<Array>} - Leaderboard data
     */
    async getLeaderboard(sessionCode) {
      const options = {
        method: 'POST',
        headers: this.createHeaders()
      };
      
      return this.fetchWithErrorHandling(`/leaderboard/${sessionCode}`, options);
    }
  
    // Participant APIs
  
    /**
     * Validate a session code
     * @param {string} sessionCode - Quiz session code
     * @param {string} name - User name
     * @returns {Promise<string>} - Validation result
     */
    async validateSessionCode(sessionCode, name) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({
          sessionCode,
          name
        })
      };
      
      return this.fetchWithErrorHandling('/validate', options);
    }
  
    /**
     * Join a quiz
     * @param {string} name - User name
     * @param {string} sessionCode - Quiz session code
     * @returns {Promise<Object>} - Join response with userId
     */
    async joinQuiz(name, sessionCode) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({
          name,
          sessionCode
        })
      };
      
      return this.fetchWithErrorHandling('/joinQuiz', options);
    }
  
    /**
     * Leave a quiz
     * @param {string} name - User name
     * @param {string} sessionCode - Quiz session code
     * @param {string} userId - User ID
     * @returns {Promise<string>} - Leave confirmation
     */
    async leaveQuiz(name, sessionCode, userId) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({
          name,
          sessionCode,
          userId
        })
      };
      
      return this.fetchWithErrorHandling('/leaveQuiz', options);
    }
  
    /**
     * Save answers for questions
     * @param {Array} answers - Array of answer objects
     * @returns {Promise<Object>} - Response with timing data
     */
    async saveAnswers(answers) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(answers)
      };
      
      return this.fetchWithErrorHandling('/save', options);
    }
  
    /**
     * Get user's leaderboard stats
     * @param {string} sessionCode - Quiz session code
     * @param {string} name - User name
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - User stats
     */
    async getUserLeaderboard(sessionCode, name, userId) {
      const options = {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({
          name,
          userId
        })
      };
      
      return this.fetchWithErrorHandling(`/userLeaderboard/${sessionCode}`, options);
    }
  
    /**
     * Health check endpoint
     * @returns {Promise<Object>} - Health status
     */
    async healthCheck() {
      const options = {
        method: 'GET',
        headers: this.createHeaders(false)
      };
      
      return this.fetchWithErrorHandling('/healthCheck', options);
    }
  }
  
  // Export as singleton
  export default new ApiService();