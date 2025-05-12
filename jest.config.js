module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|@supabase|expo-.*)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
}; 