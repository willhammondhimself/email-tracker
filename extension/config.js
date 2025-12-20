/**
 * Email Tracker Configuration
 *
 * Update BACKEND_URL to point to your deployed backend server
 *
 * Examples:
 * - Local development: 'http://localhost:3000'
 * - Railway: 'https://your-app.railway.app'
 * - Vercel: 'https://your-app.vercel.app'
 */

const CONFIG = {
  // CHANGE THIS to your backend URL
  BACKEND_URL: 'http://localhost:3000',

  // API endpoints (don't change these unless you modify the backend)
  ENDPOINTS: {
    GENERATE_PIXEL: '/api/pixel/generate',
    GET_TRACKING: '/api/tracking',
    GET_ALL: '/api/tracking/all'
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
