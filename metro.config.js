const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Only polyfill what is absolutely necessary for React Native
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
  process: require.resolve('process/browser'),
};

// Add path aliases
config.resolver.alias = {
  '@app': path.resolve(__dirname, 'app'),
  '@assets': path.resolve(__dirname, 'assets'),
  '@components': path.resolve(__dirname, 'app/components'),
  '@screens': path.resolve(__dirname, 'app/screens'),
  '@navigation': path.resolve(__dirname, 'app/navigation'),
  '@utils': path.resolve(__dirname, 'app/utils'),
  '@lib': path.resolve(__dirname, 'app/lib'),
};

module.exports = config; 