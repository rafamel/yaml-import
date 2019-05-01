const project = require('./project.config');
const EXT =
  project.get('typescript') && project.get('ext.ts')
    ? project.get('ext.js') + ',' + project.get('ext.ts')
    : project.get('ext.js');
const EXT_ARR = EXT.split(',');

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [`<rootDir>/src/**/*.{${EXT}}`],
  modulePathIgnorePatterns: [
    '<rootDir>/pkg',
    '<rootDir>/src/@types',
    '<rootDir>/src/.*/__mocks__'
  ],
  moduleFileExtensions: EXT_ARR.concat(['json']),
  testPathIgnorePatterns: ['/node_modules/']
};
