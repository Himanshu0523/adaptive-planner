module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@adaptive-planner/contracts$':
      '<rootDir>/../../packages/contracts/dist/index.js',
    '^@adaptive-planner/tool-sdk$':
      '<rootDir>/../../packages/tool-sdk/dist/index.js',
    '^@adaptive-planner/config$':
      '<rootDir>/../../packages/config/dist/index.js',
  },
};
