/* Backend Jest config for ESM with ts-jest useESM: true. */
const isCI = !!process.env.CI;
const useContainers = process.env.JEST_INTEGRATION_MODE === 'testcontainers';

export default {
  displayName: 'backend-esm',
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  rootDir: '.',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/?(*.)+(test).[tj]s'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|js)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.testing.json',
        isolatedModules: true,
        diagnostics: true,
      },
    ],
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globalSetup: useContainers ? '<rootDir>/test/env/global-setup.ts' : undefined,
  globalTeardown: useContainers ? '<rootDir>/test/env/global-teardown.ts' : undefined,
  testTimeout: useContainers ? 60000 : 20000,
  collectCoverage: isCI || !!process.env.COVERAGE,
  collectCoverageFrom: [
    '<rootDir>/**/*.{ts,js}',
    '!<rootDir>/**/*.d.ts',
    '!<rootDir>/**/__tests__/**',
    '!<rootDir>/**/test/**',
    '!<rootDir>/**/tests/**',
    '!<rootDir>/**/scripts/**',
    '!<rootDir>/**/migrations/**',
    '!<rootDir>/**/seeders/**',
    '!<rootDir>/**/config/**',
    '!<rootDir>/models/index.*',
    '!<rootDir>/jest.*',
    '!<rootDir>/server.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/test/',
    '/tests/',
    '/scripts/',
    '/migrations/',
    '/seeders/',
    '/config/',
    'server.js',
    '\\.d\\.ts$',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/test/helpers/',
  ],
  reporters: isCI
    ? [
        'default',
        ['jest-junit', { outputDirectory: '<rootDir>/reports', outputName: 'junit.xml' }],
      ]
    : ['default'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};