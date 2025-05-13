import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

// Set up global polyfills
global.Buffer = Buffer;

// Removed WebSocket polyfill. Use the global WebSocket provided by React Native.

// Polyfill for process (keep if needed for Supabase or your app)
if (typeof process === 'undefined') {
  global.process = require('process/browser');
}

// Removed all other polyfills as they are not needed in React Native 