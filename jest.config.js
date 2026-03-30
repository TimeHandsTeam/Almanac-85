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
          require.resolve('@babel/preset-typescript'),
          [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
        ],
        plugins: [
          require.resolve('@babel/plugin-transform-flow-strip-types'),
          require.resolve('@babel/plugin-transform-modules-commonjs'),
          require.resolve('babel-plugin-syntax-hermes-parser'),
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)',
  ],
};
