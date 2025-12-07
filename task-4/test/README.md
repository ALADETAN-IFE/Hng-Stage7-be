# Test Suite

This directory contains unit and integration tests for the document processing service.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Files

- **database.test.ts** - Tests for database service operations (create, read, update)
- **extract.test.ts** - Tests for text extraction from various file formats
- **controller.test.ts** - Tests for API endpoint handlers
- **ai.test.ts** - Tests for AI analysis service

## Test Structure

Tests use Jest as the testing framework with TypeScript support via ts-jest. The test suite includes:

- Unit tests for individual service functions
- Mocked dependencies for isolated testing
- Integration tests for database operations
- Error handling and edge case coverage

## Notes

- Test databases and files are created in temporary directories (`test-data/`, `test-files/`)
- These directories are automatically cleaned up after tests
- Mocked services allow testing without external dependencies (OpenRouter API, file system)

