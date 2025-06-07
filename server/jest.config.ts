import { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ...createDefaultPreset().transform,
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  verbose: true,
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

export default config;