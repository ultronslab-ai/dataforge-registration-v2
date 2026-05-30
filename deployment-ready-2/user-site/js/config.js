const DEPLOYED_API_BASE_URL = 'https://dataforge-registration-v2.onrender.com/api';
const LOCAL_API_BASE_URL = 'http://localhost:4000/api';

const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? LOCAL_API_BASE_URL
    : DEPLOYED_API_BASE_URL,
  MAX_TEAM_MEMBERS: 4,
  CURRENCY_SYMBOL: 'INR '
};

export default CONFIG;
