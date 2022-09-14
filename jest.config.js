/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  testEnvironmentOptions: { resources: 'usable' },
  setupFiles: ['jest-webgl-canvas-mock'],
  transform: { '^.+\\.[m|t]?js$': 'babel-jest' },
  transformIgnorePatterns: [],
};
