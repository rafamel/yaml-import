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
    '.*\\.d\\.ts$',
    '<rootDir>/pkg',
    '<rootDir>/dist',
    '<rootDir>/src/@types',
    '<rootDir>/src/.*/__mocks__',
    '<rootDir>/src/bin/yimp.ts'
  ],
  moduleFileExtensions: EXT_ARR.concat(['json']),
  testPathIgnorePatterns: ['/node_modules/']
};
