/**
 * 
 * CSRF Protection Utilities for Frontend
 */

/**
 * Get CSRF Token
 * @returns {string|null} CSRF token or null
 */
export const getCSRFToken = () => {
  // Get CSRF token from cookie
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

/**
 * Add CSRF token to request headers
 * @param {Object} headers - Existing request headers
 * @returns {Object} Request headers with CSRF token
 */
export const addCSRFToken = (headers = {}) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  return headers;
};

/**
 * Check if the response is a CSRF error
 * @param {Response} response - fetch response object
 * @returns {boolean} Is it a CSRF error?
 */
export const isCSRFError = (response) => {
  return response.status === 403;
};