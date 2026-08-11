const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080' 
  : 'https://jevanready-backend-production.up.railway.app';

export default API_BASE_URL;