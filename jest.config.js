const { EXTENSIONS } = require('./project.config');
const EXT_ARR = EXTENSIONS.split(',');

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [`<rootDir>/src/**/*.{${EXTENSIONS}}`],
  modulePathIgnorePatterns: ['<rootDir>/build', '<rootDir>/src/bin'],
  moduleFileExtensions: EXT_ARR.concat(['json']),
  testMatch: [
    `**/__tests__/**/*.{${EXTENSIONS}}`,
    `**/?(*.)+(spec|test).{${EXTENSIONS}}`
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    [`^.+\\.(${EXT_ARR.join('|')})$`]: 'babel-jest'
  }
};
