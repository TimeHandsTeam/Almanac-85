'use strict';

const preset = require('jest-expo/jest-preset');

module.exports = {
  ...preset,
  // Use only react-native setup; skip jest-expo setup that loads expo/src/winter
  setupFiles: [
    require.resolve('react-native/jest/setup.js'),
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    ...preset.moduleNameMapper,
  },
  transform: {
    ...preset.transform,
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: false,
        babelrc: false,
        presets: [
          [require.resolve('@react-native/babel-preset'), { disableImportExportTransform: false }],
          require.resolve('@babel/preset-typescript'),
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)',
  ],
};
