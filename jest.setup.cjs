// Mock global objects needed for tests (not in tests that run in the node environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
  });
}

// Silence console errors during tests
console.error = jest.fn();
