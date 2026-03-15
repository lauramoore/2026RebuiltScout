/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Use a preset that is optimized for TypeScript projects using ES Modules.
  // This preset automatically configures `ts-jest` to handle `.ts` files as ES Modules,
  // and sets up a module name mapper to correctly resolve `.js` extensions in imports
  // to their `.ts` source files (e.g., './scout_types.js' -> './scout_types.ts').
  preset: 'ts-jest/presets/default-esm',

  // The environment in which the tests will be run. 'node' is suitable for backend/Firebase Functions code.
  testEnvironment: 'node',

  // A list of glob patterns that Jest uses to detect test files.
  // This pattern is configured to find all `.test.ts` files within the `functions/src` directory.
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
  ],

  // Indicates whether coverage information should be collected while executing the test.
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected.
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    // Exclude type definition files from coverage as they don't contain executable code.
    '!src/cloudstorage/scout_types.ts',
  ],

  // The directory where Jest should output its coverage files.
  coverageDirectory: 'coverage/jest',

  // The code coverage provider to use. 'v8' is built-in to Node.js and is fast.
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports.
  coverageReporters: ['text', 'lcov', 'clover', 'json-summary'],
};
