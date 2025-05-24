import { pruneExpiredSavedStates } from '../../hooks/useSavedTimerStates';
import * as useTimerModule from '../../hooks/useTimer';
import { SavedState } from '../../types/timer';

// Mock the calculateRemainingMs function from useTimer.ts
jest.mock('../../hooks/useTimer', () => ({
  ...jest.requireActual('../../hooks/useTimer'),
  calculateRemainingMs: jest.fn(),
}));

describe('pruneExpiredSavedStates', () => {
  // Store the original implementation
  const originalCalculateRemainingMs = jest.requireActual('../../hooks/useTimer').calculateRemainingMs;
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore the original implementation if needed
    jest.restoreAllMocks();
  });

  it('should filter out null or undefined input', () => {
    expect(pruneExpiredSavedStates(null as any)).toEqual([]);
    expect(pruneExpiredSavedStates(undefined as any)).toEqual([]);
  });

  it('should return empty array for non-array input', () => {
    expect(pruneExpiredSavedStates({} as any)).toEqual([]);
    expect(pruneExpiredSavedStates('not an array' as any)).toEqual([]);
  });

  it('should filter out states with missing timerState', () => {
    const states = [
      { id: '1', name: 'Valid', savedAt: Date.now(), timerState: null, appSettings: {} } as any,
      { id: '2', name: 'Valid2', savedAt: Date.now(), appSettings: {} } as any,
    ];

    const result = pruneExpiredSavedStates(states);
    expect(result).toEqual([]);
  });

  it('should keep states with remaining time above -10 minutes', () => {
    const mockCalculateRemainingMs = useTimerModule.calculateRemainingMs as jest.Mock;

    // Create test data
    const now = Date.now();
    const states: SavedState[] = [
      {
        id: '1',
        name: 'Recent state',
        savedAt: now,
        timerState: { totalMs: 60000, paused: true, startTime: now, pauseStart: now, totalPauseMs: 0 },
        appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
      },
      {
        id: '2',
        name: 'Expired state',
        savedAt: now - 1000 * 60 * 15, // 15 minutes old
        timerState: { totalMs: 60000, paused: true, startTime: now - 1000 * 60 * 15, pauseStart: now, totalPauseMs: 0 },
        appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
      },
      {
        id: '3', 
        name: 'Almost expired state', 
        savedAt: now,
        timerState: { totalMs: 60000, paused: true, startTime: now, pauseStart: now, totalPauseMs: 0 },
        appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
      }
    ];

    // Mock the return values for each state
    mockCalculateRemainingMs
      .mockReturnValueOnce(30000) // For state 1: 30 seconds remaining - should keep
      .mockReturnValueOnce(-1000 * 60 * 11) // For state 2: -11 minutes - should prune
      .mockReturnValueOnce(-1000 * 60 * 9); // For state 3: -9 minutes - should keep (within 10 min limit)

    const result = pruneExpiredSavedStates(states);
    
    // We should have 2 states (the first and third)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');

    // Verify calculateRemainingMs was called with the correct timer states
    expect(mockCalculateRemainingMs).toHaveBeenCalledTimes(3);
    expect(mockCalculateRemainingMs).toHaveBeenCalledWith(states[0].timerState);
    expect(mockCalculateRemainingMs).toHaveBeenCalledWith(states[1].timerState);
    expect(mockCalculateRemainingMs).toHaveBeenCalledWith(states[2].timerState);
  });

  it('should work with the real calculateRemainingMs implementation', () => {
    // Restore the original implementation for this test
    (useTimerModule.calculateRemainingMs as jest.Mock).mockImplementation(originalCalculateRemainingMs);
    
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const twentyMinutesAgo = now - 20 * 60 * 1000;
    
    const states: SavedState[] = [
      // A timer that started 20 minutes ago with 5 minutes duration - should be pruned
      // This is more than 10 minutes past expiration
      {
        id: '1',
        name: 'Expired timer',
        savedAt: twentyMinutesAgo,
        timerState: { 
          totalMs: 5 * 60 * 1000, // 5 minutes
          paused: false, 
          startTime: twentyMinutesAgo, 
          pauseStart: 0, 
          totalPauseMs: 0 
        },
        appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
      },
      // A timer that started 5 minutes ago with 20 minutes duration - should be kept
      {
        id: '2',
        name: 'Active timer',
        savedAt: fiveMinutesAgo,
        timerState: { 
          totalMs: 20 * 60 * 1000, // 20 minutes
          paused: false, 
          startTime: fiveMinutesAgo, 
          pauseStart: 0, 
          totalPauseMs: 0 
        },
        appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
      }
    ];

    const result = pruneExpiredSavedStates(states);
    
    // Should only keep the second timer
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should handle edge case with exactly -10 minutes remaining', () => {
    const mockCalculateRemainingMs = useTimerModule.calculateRemainingMs as jest.Mock;
    
    const now = Date.now();
    const states: SavedState[] = [{
      id: '1',
      name: 'Borderline state',
      savedAt: now,
      timerState: { totalMs: 60000, paused: true, startTime: now, pauseStart: now, totalPauseMs: 0 },
      appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
    }];
    
    // Mock the return value to be exactly -10 minutes
    mockCalculateRemainingMs.mockReturnValueOnce(-10 * 60 * 1000);
    
    const result = pruneExpiredSavedStates(states);
    
    // Should keep the timer because it's exactly at the threshold
    expect(result).toHaveLength(1);
  });
  
  it('should handle edge case with exactly -10 minutes and 1ms remaining', () => {
    const mockCalculateRemainingMs = useTimerModule.calculateRemainingMs as jest.Mock;
    
    const now = Date.now();
    const states: SavedState[] = [{
      id: '1',
      name: 'Just beyond threshold',
      savedAt: now,
      timerState: { totalMs: 60000, paused: true, startTime: now, pauseStart: now, totalPauseMs: 0 },
      appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
    }];
    
    // Mock the return value to be just beyond the threshold
    mockCalculateRemainingMs.mockReturnValueOnce(-10 * 60 * 1000 - 1);
    
    const result = pruneExpiredSavedStates(states);
    
    // Should prune the timer because it's just beyond the threshold
    expect(result).toHaveLength(0);
  });

  it('should handle paused timers correctly', () => {
    (useTimerModule.calculateRemainingMs as jest.Mock).mockImplementation(originalCalculateRemainingMs);
    
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    
    // A timer that started 15 minutes ago, ran for 5 minutes, then was paused 10 minutes ago
    // Still has 5 minutes remaining on the timer
    const states: SavedState[] = [{
      id: '1',
      name: 'Paused timer with time left',
      savedAt: fifteenMinutesAgo,
      timerState: { 
        totalMs: 10 * 60 * 1000, // 10 minutes total
        paused: true,
        startTime: fifteenMinutesAgo, 
        pauseStart: now - 10 * 60 * 1000, // Paused 10 minutes ago
        totalPauseMs: 0
      },
      appSettings: { darkMode: true, fontSize: 48, embedOverflow: false, wakeLockEnabled: false }
    }];
    
    const result = pruneExpiredSavedStates(states);
    
    // Should keep the timer because even though it's old, it's paused with time left
    expect(result).toHaveLength(1);
  });
});
