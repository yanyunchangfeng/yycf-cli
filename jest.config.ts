import type { Config } from 'jest';
import { defaults as tsjPreset } from 'ts-jest/presets';

const config: Config = {
  testEnvironment: 'node',
  collectCoverage: true,
  transform: {
    ...tsjPreset.transform,
    '/test/.*\\.spec\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        emitDecoratorMetadata: true,
        experimentalDecorators: true
      }
    ]
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1'
  },

  coverageReporters: ['lcov', 'html', 'text-summary'],
  testRegex: '/test/.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*'],
  testTimeout: 60 * 1000
};

export default config;
