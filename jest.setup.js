require('@testing-library/jest-dom');

// Polyfill TextEncoder for React Router/Node.js
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util');
  global.TextEncoder = TextEncoder;
}
