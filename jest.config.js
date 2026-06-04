module.exports = {
  preset: 'jest-expo',
  // Most tests mock `../lib/supabase`, but allow transforming the ESM packages
  // we do touch so an accidental real import doesn't blow up.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|react-native-url-polyfill))',
  ],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};
