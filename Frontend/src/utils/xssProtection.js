/**
 * 
 * Basic XSS Protection Utils for Assignment
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - The sanitized HTML
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Use DOMPurify to sanitize HTML
  return DOMPurify.sanitize(html, {
    // Allowed tags (for assignment purposes, only basic formatting is allowed)
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    // Allowed attributes
    ALLOWED_ATTR: [],
    // Remove all event handlers
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
    // Remove script tags
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form']
  });
};

/**
 * Escape HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
};

/**
 * Detect potential XSS patterns in input
 * @param {string} input - User input
 * @returns {boolean} - Whether suspicious content is included
 */
export const detectXSS = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // Common XSS attack patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Validate user input for XSS threats
 * @param {string} input - User input
 * @returns {object} - {isValid: boolean, message: string}
 */
export const validateInput = (input) => {
  if (detectXSS(input)) {
    return {
      isValid: false,
      message: 'Input contains unsafe content, please check and resubmit'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};
