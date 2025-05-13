module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@app': './app',
            '@assets': './assets',
            '@components': './app/components',
            '@screens': './app/screens',
            '@navigation': './app/navigation',
            '@utils': './app/utils',
            '@lib': './app/lib'
          }
        }
      ],
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-runtime',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
    env: {
      production: {
        // Removed react-native-paper/babel plugin
      }
    }
  };
}; 