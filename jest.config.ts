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
    '^src/(.*)$': '<rootDir>/src/$1'
  },

  coverageReporters: ['lcov', 'html'],
  testRegex: '/test/.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*']
};

export default config;
