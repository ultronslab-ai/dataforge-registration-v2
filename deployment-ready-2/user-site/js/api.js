import CONFIG from './config.js';

class Api {
  static async request(endpoint, options = {}) {
    try {
      const url = `${CONFIG.API_BASE_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (options.body instanceof FormData) {
        delete headers['Content-Type']; // Let browser set boundary
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static getEvents() {
    return this.request('/events').then(res => res.data);
  }

  static getEvent(id) {
    return this.request(`/events/${id}`).then(res => res.data);
  }

  static register(formData) {
    return this.request('/registrations', {
      method: 'POST',
      body: formData
    });
  }
}

export default Api;
