// Test environment setup
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3004';
process.env['REDIS_HOST'] = 'localhost';
process.env['REDIS_PORT'] = '6379';
process.env['POSTGRES_HOST'] = 'localhost';
process.env['POSTGRES_PORT'] = '5432';
process.env['POSTGRES_DB'] = 'gitshadow_test';
process.env['POSTGRES_USER'] = 'gitshadow';
process.env['POSTGRES_PASSWORD'] = 'gitshadow123';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 